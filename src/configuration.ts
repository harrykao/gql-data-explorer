import { createContext, useContext } from "react";

export interface View {
    objectName: string;
}

export interface Config {
    views: View[];
}

export const DEFAULT_CONFIG: Config = {
    views: [],
};

export const ConfigContext = createContext<Config>(DEFAULT_CONFIG);

export default function useConfiguration(): Config {
    return useContext(ConfigContext);
}
