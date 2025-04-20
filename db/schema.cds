namespace myapp;
entity User {
    key userId: String;
    firstName: String;
    lastName: String;
    mobileNumber: Integer64;
    gender: String;
    emailId: String;
    Password: String;
    failedCount: Integer @default: 0;
    accountStatus: String @default: 'Active';
}
