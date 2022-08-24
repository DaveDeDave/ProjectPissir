import { createRouter, createWebHistory } from "vue-router";

import Authentication from "./pages/Authentication.vue";

const User = () => import("./pages/User.vue");
const Companies = () => import("./pages/Companies.vue");
const Company = () => import ("./pages/Company.vue");
const Employees = () => import("./pages/Employees.vue");
const Employee = () => import("./pages/Employee.vue");
const Fields = () => import("./pages/Fields.vue");
const Field = () => import("./pages/Field.vue");
const Sensor = () => import("./pages/Sensor.vue");
const Actuator = () => import("./pages/Actuator.vue");
const NotFound = () => import("./pages/NotFound.vue");
import { getData } from "./libs/jwt";

const routes = [
  { path: "/", component: Authentication, meta: { title: "Pissir" } },
  { path: "/dashboard/user", component: User, meta: { title: "Pissir - Dashboard - My user", authenticated: true } },
  { path: "/dashboard/company", component: Companies, meta: { title: "Pissir - Dashboard - Company", authenticated: true, admin: true } },
  { path: "/dashboard/company/:id", component: Company, meta: { title: "Pissir - Dashboard - Company", authenticated: true, admin: true } },
  { path: "/dashboard/employee", component: Employees, meta: { title: "Pissir - Dashboard - Employee", authenticated: true, admin: true } },
  { path: "/dashboard/employee/:id", component: Employee, meta: { title: "Pissir - Dashboard - Employee", authenticated: true, admin: true } },
  { path: "/dashboard/field", component: Fields, meta: { title: "Pissir - Dashboard - Field", authenticated: true } },
  { path: "/dashboard/field/:id", component: Field, meta: { title: "Pissir - Dashboard - Field", authenticated: true } },
  { path: "/dashboard/field/:id/sensor/:topic", component: Sensor, meta: { title: "Pissir - Dashboard - Field", authenticated: true } },
  { path: "/dashboard/field/:id/actuator/:topic", component: Actuator, meta: { title: "Pissir - Dashboard - Field", authenticated: true } },
  { path: "/:pathMatch(.*)*", name: "404", component: NotFound, meta: { title: "Pissir - Not found" } },
];

const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: "active",
  routes
});

router.beforeEach((to) => {
  document.title = to.meta.title;
  const jwt = localStorage.getItem("token");

  if (to.meta.authenticated) {
    if (!jwt) return { path: "/" };
    const data = getData(jwt);
    if (to.meta.admin && data.type != "admin") return { path: "/dashboard/user" }
  } else if (to.path == "/" && jwt) {
    return { path: "/dashboard/user" }
  }
});

export { router };