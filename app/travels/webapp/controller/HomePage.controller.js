sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment"
], (Controller, JSONModel, ODataModel, MessageToast, MessageBox,Fragment) => {
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
      const payload = {
        firstName: sap.ui.getCore().byId("firstName").getValue(),
        lastName: sap.ui.getCore().byId("lastName").getValue(),
        mobileNumber: parseInt(sap.ui.getCore().byId("mobileNumber").getValue(), 10),
        gender: sap.ui.getCore().byId("gender").getValue(),
        emailId: sap.ui.getCore().byId("emailId").getValue(),
        Password: sap.ui.getCore().byId("password").getValue()
      };

      // Call OData create
      this.oModel.create("/Users", payload, {
        success: () => {
          MessageBox.information("Resgistration Successful!");
          this.registerDialog.close();
        },
        error: (err) => {
          MessageBox.information("Registration failed!");
          console.error("Error:", err);
        }
      });
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
