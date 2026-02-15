import React, { useState } from "react";
import { Config, ConfigContext, DEFAULT_CONFIG } from "./configuration";

export const ConfigurationProvider = ({ children }) => {
    const [config, setConfig] = useState(DEFAULT_CONFIG);

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
