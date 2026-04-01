package com.killaura;

import com.killaura.config.KillauraConfig;
import com.killaura.module.ModuleManager;
import net.fabricmc.api.ClientModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class KillauraClient implements ClientModInitializer {
    public static final String MOD_ID = "killaura-client";
    public static final String MOD_NAME = "KillAura Client";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_NAME);

    private static KillauraClient instance;
    private ModuleManager moduleManager;
    private KillauraConfig config;

    @Override
    public void onInitializeClient() {
        instance = this;
        LOGGER.info("Initializing {}...", MOD_NAME);

        config = new KillauraConfig();
        config.load();

        moduleManager = new ModuleManager();

        LOGGER.info("{} initialized!", MOD_NAME);
    }

    public static KillauraClient getInstance() {
        return instance;
    }

    public ModuleManager getModuleManager() {
        return moduleManager;
    }

    public KillauraConfig getConfig() {
        return config;
    }
}
