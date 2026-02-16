import React, { useState } from "react";
import { Config, ConfigContext } from "./configuration";

interface ConfigurationProviderProps {
    children: React.ReactNode;
}

export const ConfigurationProvider = ({ children }: ConfigurationProviderProps) => {
    const [config, setConfig] = useState<Config | null>(null);

    import(`../${import.meta.env.VITE_CONFIG_FILE}`)
        .then((module) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            setConfig(module.default as Config);
        })
        .catch(() => {
            console.log("could not load config");
        });

    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

interface MockedConfigurationProviderProps {
    config: Config;
    children: React.ReactNode;
}

export const MockedConfigurationProvider = ({
    config,
    children,
}: MockedConfigurationProviderProps) => {
    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};
