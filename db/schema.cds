namespace myapp;

entity User {
    key userId: Integer;
    firstName: String;
    lastName: String;
    mobileNumber: Integer;
    gender: String;
    emailId: String;
    Password: String;
    failedCount: Integer @default: 0;
    accountStatus: String @default: 'Active';
}
