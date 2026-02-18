import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    RouteComponent,
    RouterProvider,
} from "@tanstack/react-router";
import React from "react";

interface Props {
    component: RouteComponent;
    initialEntry: string | null; // defaults to "/"
}

export const MockedRouterProvider = ({ component, initialEntry }: Props) => {
    const rootRoute = createRootRoute();
    const rootQueryRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: "$",
        component,
    });
    const routeTree = rootRoute.addChildren([rootQueryRoute]);

    const history = createMemoryHistory({ initialEntries: [initialEntry ?? "/"] });
    const router = createRouter({ routeTree, history });

    return <RouterProvider router={router} />;
};
