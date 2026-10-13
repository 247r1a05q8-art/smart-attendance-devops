const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

let child;
let base;

test.before(async () => {
    child = spawn(process.execPath, ['server.js'], {
        cwd: process.cwd(),
        env: {
            ...process.env,
            PORT: '18080'
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', data => {
        process.stdout.write('[SERVER] ' + data);
    });

    child.stderr.on('data', data => {
        process.stderr.write('[SERVER ERROR] ' + data);
    });

    base = 'http://127.0.0.1:18080';

    for (let i = 0; i < 50; i++) {
        if (child.exitCode !== null) {
            throw new Error(
                'Server exited before starting. Exit code: ' +
                child.exitCode
            );
        }

        try {
            const response = await fetch(base + '/health');

            if (response.ok) {
                return;
            }
        } catch (error) {
            // Server may still be starting.
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    child.kill();
    throw new Error('Server did not start within 5 seconds');
});

test.after(() => {
    if (child && child.exitCode === null && !child.killed) {
        child.kill();
    }
});

test('health endpoint is available', async () => {
    const response = await fetch(base + '/health');

    assert.equal(response.status, 200);

    const data = await response.json();
    assert.equal(data.status, 'ok');
});

test('demo student can login', async () => {
    const response = await fetch(base + '/api/login', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            email: 'student@demo.local',
            password: 'Student@123'
        })
    });

    assert.equal(response.status, 200);

    const data = await response.json();
    assert.equal(data.role, 'STUDENT');
});

test('student attendance analysis is available', async () => {
    const loginResponse = await fetch(base + '/api/login', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            email: 'student@demo.local',
            password: 'Student@123'
        })
    });

    assert.equal(loginResponse.status, 200);

    const user = await loginResponse.json();

    const response = await fetch(
        base + '/api/student/attendance',
        {
            headers: {
                'x-user-id': String(user.id),
                'x-user-role': user.role
            }
        }
    );

    assert.equal(response.status, 200);

    const data = await response.json();

    assert.ok(Array.isArray(data.subjects));
    assert.ok(Array.isArray(data.trend));
});
