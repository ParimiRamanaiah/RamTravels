const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Users } = this.entities;

    this.on('CREATE', 'Users', async (req) => {
        const data = req.data;
        console.log("[CREATE] Incoming user data:", data);

        if (data.failedCount === undefined) {
            data.failedCount = 0;
        }
        if (!data.accountStatus) {
            data.accountStatus = 'Active';
        }

        // Check for existing user by email
        const exists = await SELECT.one.from(Users).where({ emailId: data.emailId });

        if (exists) {
            return req.reject(400, `A user with this email already exists: ${data.emailId}`);
        }

        // Create new user
        const result = await INSERT.into(Users).entries(data);
        console.log("[CREATE] User created successfully:", result);

        return result;
    });

    this.on('PATCH','Users',async(req)=>{
        
    })
});
