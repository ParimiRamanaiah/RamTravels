sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",
  "sap/ui/core/ValueState",

], (Controller, JSONModel, ODataModel, MessageToast, MessageBox,Fragment,ValueState) => {
  "use strict";

  return Controller.extend("com.ram.travels.controller.HomePage", {
    onInit() {
      var sServiceUrl = "/odata/v2/user/";
      this.oModel = new ODataModel(sServiceUrl, true);
      this.getView().setModel(this.oModel);
    },

    onRegister: async function () {
      if (!this.registerDialog) {
        this.registerDialog = await Fragment.load({
          name: "com.ram.travels.view.RegisterDialog",
          controller: this
        });
        this.getView().addDependent(this.registerDialog);
      }
      this.registerDialog.open();
    },

    onCloseRegister: function () {
      this.registerDialog.close();
    },

    onSubmitRegister: function () {
      let firstName = sap.ui.getCore().byId("firstName").getValue();
      let lastName = sap.ui.getCore().byId("lastName").getValue();
      let mobileNumber = sap.ui.getCore().byId("mobileNumber").getValue();
      let gender = sap.ui.getCore().byId("gender").getValue();
      let emailId = sap.ui.getCore().byId("emailId").getValue();
      let Password = sap.ui.getCore().byId("password").getValue();
      let confirmPassword=sap.ui.getCore().byId("confirmPassword").getValue();

      if(!firstName || !lastName || !mobileNumber || !gender || !emailId || !Password){
        MessageBox.information("Please fill in all required fields.");
        return;
      }

      if(mobileNumber.length !== 10){
        sap.ui.getCore().byId("mobileNumber").setValueState(ValueState.Error);
        sap.ui.getCore().byId("mobileNumber").setValueStateText("Mobile Number should be exactly 10 digits");
        return;
      }
      else{
        sap.ui.getCore().byId("mobileNumber").setValueState(ValueState.None);
      }
      
      let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if(!emailPattern.test(emailId)){
       sap.ui.getCore().byId("emailId").setValueState(ValueState.Error);
       sap.ui.getCore().byId("emailId").setValueStateText("Please Enter a valid email address.");
       return;
      }
      else{
        sap.ui.getCore().byId("emailId").setValueState(ValueState.None);
      }

      let passwordPattern = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/;
      if(!passwordPattern.test(Password)){
        sap.ui.getCore().byId("password").setValueState(ValueState.Error);
        sap.ui.getCore().byId("password").setValueStateText("Password must be longer than 8 characters and atleast one special character.");
        return;
      }
      else{
        sap.ui.getCore().byId("password").setValueState(ValueState.None);
      }

      if(Password !== confirmPassword){
        MessageBox.information("Password and Confirm Password should be the same.");
        return;
      }

      const payload = {
        firstName: firstName,
        lastName: lastName,
        mobileNumber: mobileNumber,
        gender: gender,
        emailId: emailId,
        Password: Password
      }

      // Call OData create
      this.oModel.create("/Users", payload, {
        success: () => {
          MessageBox.success("Resgistration Successful!");
          this.onRegisterClear();
          this.registerDialog.close();
        },
        error: (err) => {
          MessageBox.error("Registration failed!");
          console.error("Error:", err);
        }
      });
    },

    onRegisterClear:function(){
       sap.ui.getCore().byId("firstName").setValue("");
       sap.ui.getCore().byId("lastName").setValue("");
       sap.ui.getCore().byId("mobileNumber").setValue("");
       sap.ui.getCore().byId("gender").setValue("");
       sap.ui.getCore().byId("emailId").setValue("");
       sap.ui.getCore().byId("password").setValue("");
       sap.ui.getCore().byId("confirmPassword").setValue("");
    },

    onLogin:async function(){
      if(this.loginDialog===undefined){
        this.loginDialog=sap.ui.xmlfragment(this.getView().getId(),"com.ram.travels.view.LoginDialog",this);
        this.getView().addDependent(this.loginDialog);
      }
      this.loginDialog.open();
    },

    onCloseLogin:function(){
      this.loginDialog.close();
    },

    onSubmitLogin:function(){
      let emailId=this.getView().byId("idUserName").getValue().trim();
      let pass=this.getView().byId("idPassword").getValue().trim();
      let flag=false;
      var count=0;

      this.oModel.read('/Users',{
        success:function(oData){
          console.log(oData,"oData");
          for(let i=0; i<oData.results.length; i++){
            let userName=oData.results[i].emailId;
            let password=oData.results[i].Password;

            if(emailId===userName && pass===password){
              MessageBox.information("Login Successfull!");
              flag=true;
              count=0;
              break;
            }
            else{
              count++;
            }
          }

          if(!flag){
            MessageBox.information("Wrong credentials. Please check your email and password.");
          }

        }.bind(this),
        error:function(){
          MessageBox.error("Failed to fetch user data.");
        }
      })
    }
  });
});
