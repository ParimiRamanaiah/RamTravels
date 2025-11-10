using myapp from '../db/schema';

using { Northwind } from './external/Northwind';

@(requires: 'authenticated-user')
service CatalogService {
  entity Products as projection on Northwind.Products;
  entity Orders as projection on Northwind.Orders;
  entity Customers as projection on Northwind.Customers;
  function getUserInfo() returns String;
}

@(requires: 'authenticated-user')
service UserService {
    entity Users as projection on myapp.User;

    function login(emailId : String, password : String) returns String;

    function getUserInfo() returns String;
}
