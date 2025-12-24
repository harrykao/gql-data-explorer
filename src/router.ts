import { createRouter, Router } from "@tanstack/react-router";
import { RouterProvider, createRootRoute, createRoute } from "@tanstack/react-router";
import App from "./App";

const rootRoute = createRootRoute();

const rootQueryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: App,
});

const routeTree = rootRoute.addChildren([rootQueryRoute]);

export const router = createRouter({ routeTree });

// declare module '@tanstack/react-router' {
//   interface Register {
//     // This infers the type of our router and registers it across your entire project
//     router: typeof router;
//   }
// }
