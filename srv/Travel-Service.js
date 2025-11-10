const { year } = require('@cap-js/hana/lib/cql-functions');
const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    this.on('getUserInfo', async(req)=>{
        try{
        console.log("inside userinfo")
        const user = req.user.id;
        console.log("user",user);
        const userData = cds.context;
        console.log("userData",userData);
        }
        catch(error){
            console.log("error",error);
        }
    })

    const { Users } = this.entities;

    //destination
    const northwind = await cds.connect.to("northwind");
    //console.log("northwind", northwind);

    const result = await northwind.get(`/V2/Northwind/Northwind.svc/Orders?$format=json`);
    //console.log("result", result);


    const Northwind = await cds.connect.to('Northwind');

    const { Orders } = Northwind.entities;
    const ordersData = await Northwind.run(SELECT(Orders).limit(5));
    //console.log("OrdersData", ordersData);

    const { Products } = Northwind.entities;

    const result1 = await Northwind.run(
        SELECT.from(Products, p => { p.ProductID,p.ProductName,p.UnitPrice,
                p.Category(c => {
                    c.CategoryID,
                    c.CategoryName,
                    c.Description
                })}).limit(1));

    //console.log(result1);


    this.on('READ', 'Products', async (req) => {
        console.log("inside edmx northwind");
        //console.log("req.query", req.query);
        return Northwind.run(req.query);
    });


    //const payload = {
    // ShipCity: "France"
    // };

    //return northwind.put(
    //`/V2/Northwind/Northwind.svc/Orders(10347)`,
    //payload
    //);

    //Resgistration
    this.on('CREATE', 'Users', async (req) => {
        const data = req.data;
        //console.log("[CREATE] Incoming user data:", data);

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const emailPrefix = data.emailId.split('@')[0];
        data.userId = `${emailPrefix} - ${year} - ${month} - ${day}`
        data.lockedAt = null;

        if (data.failedCount === undefined) {
            data.failedCount = 0;
        }
        if (!data.accountStatus) {
            data.accountStatus = 'Active';
        }

        // Check for existing user by email
        const exists = await SELECT.one.from(Users).where({ emailId: data.emailId });

        if (exists) {
            return {
                message: `A user with this email already exists ${data.emailId}`,
            }
        }

        // Create new user
        const result = await INSERT.into(Users).entries(data);
        //console.log("[CREATE] User created successfully:", result);

        return {
            message: `Registration Successfull: ${data.userId}`,
        };
    });

    //Login
    this.on("login", async (req) => {
        const { emailId, password } = req.data;
        console.log("emailId", emailId);
        console.log("password", password);

        if (!emailId || !isValidEmail(emailId)) {
            return { message: `Please enter a valid email address.` };
        }

        const user = await SELECT.one.from(Users).where({ emailId: emailId });
        console.log("userEmailId", user);

        if (!user) {
            return { message: `Something went wrong, Please try again and give correct credentials` };
        }

        if (user.accountStatus === 'Inactive') {
            if (user.lockedAt) {
                const lockedAt = new Date(user.lockedAt);
                //console.log("lockedAt", lockedAt);
                const unlockAt = new Date(lockedAt.getTime() + 30 * 60 * 1000);
                //console.log("unlockedAt", unlockAt);
                const now = new Date();
                //console.log("now", now);


                console.log("lockedAt:", lockedAt.toISOString());
                console.log("unlockAt:", unlockAt.toISOString());
                console.log("now:", now.toISOString());
                console.log("Time difference (ms):", unlockAt - now);

                if (now >= unlockAt) {
                    await UPDATE(Users).set({
                        failedCount: 0,
                        accountStatus: 'Active',
                        lockedAt: null
                    }).where({ emailId: emailId });
                    return { message: "Account unlocked, please try logging in again." };
                } else {
                    const minutesLeft = Math.ceil((unlockAt - now) / (1000 * 60));
                    return { message: `Account locked. Try again after ${minutesLeft} minutes.` };
                }
            } else {
                return { message: `Account locked due to multiple failed login attempts.` };
            }
        }

        if (emailId === user.emailId && password === user.Password) {
            await UPDATE(Users).set({ failedCount: 0, accountStatus: 'Active', lockedAt: null }).where({ emailId: emailId });
            return { message: `Login Successful: ${emailId}` };
        }
        else {
            let failedCount = (user.failedCount || 0) + 1;
            let updates = { failedCount: failedCount };
            let message;
            if (failedCount > 3) {
                updates.accountStatus = 'Inactive';
                updates.lockedAt = new Date().toISOString();
                message = `Account locked due to multiple failed login attempts.Try after sometime`;
            } else {
                message = `Something went wrong, Please try again and give correct credentials`;
            }
            await UPDATE(Users).set(updates).where({ emailId: emailId });
            return { message };
        }
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

});
