import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function test() {
    console.log("--- Starting Authentication & Authorization Tests ---");

    try {
        // 1. Setup Admin
        console.log("\n1. Setting up admin...");
        const setupRes = await axios.post(`${BASE_URL}/auth/setup-admin`);
        console.log("Setup Admin Result:", setupRes.data.message);

        // 2. Login as Admin
        console.log("\n2. Logging in as admin...");
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        const adminToken = loginRes.data.token;
        console.log("Admin Login Success. Token received.");

        // 3. Test Admin Protected Route (Get Deleted Complaints)
        console.log("\n3. Testing admin protected route...");
        const deletedRes = await axios.get(`${BASE_URL}/complaints/deleted`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log("Access to deleted complaints successful (Count:", deletedRes.data.length, ")");

        // 4. Test Resident Access to Admin Route (Should Fail)
        console.log("\n4. Testing resident access to admin route (should fail)...");
        // Register a resident first
        const resUsername = 'testresident_' + Date.now();
        const residentRegRes = await axios.post(`${BASE_URL}/auth/register`, {
            username: resUsername,
            email: `test_${Date.now()}@example.com`
        });
        const residentToken = residentRegRes.data.token;
        console.log(`Resident registered: ${resUsername}`);

        try {
            await axios.get(`${BASE_URL}/complaints/deleted`, {
                headers: { Authorization: `Bearer ${residentToken}` }
            });
            console.error("FAIL: Resident was able to access admin route!");
        } catch (err) {
            if (err.response?.status === 403) {
                console.log("PASS: Resident correctly denied access (403 Forbidden)");
            } else {
                console.error(`FAIL: Unexpected error status: ${err.response?.status}`);
            }
        }

        // 5. Test Registering with 'admin' username (Should Fail)
        console.log("\n5. Testing registration with 'admin' username (should fail)...");
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                username: 'admin',
                email: `hacker_${Date.now()}@example.com`
            });
            console.error("FAIL: Resident was able to register with 'admin' username!");
        } catch (err) {
            if (err.response?.status === 400) {
                console.log("PASS: 'admin' username registration correctly denied (400 Bad Request)");
            } else {
                console.error(`FAIL: Unexpected error status: ${err.response?.status}`);
            }
        }

        // 6. Test Logout (Role should NOT reset)
        console.log("\n6. Testing logout role persistence...");
        await axios.post(`${BASE_URL}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log("Admin logged out.");

        // Login again to check if role is still admin
        const loginRes2 = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        if (loginRes2.data.role === 'admin') {
            console.log("PASS: Admin role persisted after logout.");
        } else {
            console.error("FAIL: Admin role was reset to:", loginRes2.data.role);
        }

        console.log("\n--- Tests Completed Successfully ---");

    } catch (err) {
        console.error("\nERROR during testing:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
        }
    }
}

test();
