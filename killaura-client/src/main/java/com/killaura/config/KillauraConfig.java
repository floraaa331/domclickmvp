package com.killaura.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.killaura.KillauraClient;
import net.fabricmc.loader.api.FabricLoader;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class KillauraConfig {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private final Path configPath;

    // KillAura settings
    public boolean killauraEnabled = false;
    public double killauraRange = 3.0;
    public boolean killauraPlayersOnly = false;
    public boolean killauraHostileOnly = false;
    public boolean killauraAnimalOnly = false;
    public boolean killauraCooldownSync = true;    // sync with vanilla attack cooldown
    public float killauraCooldownThreshold = 1.0f; // 1.0 = full cooldown (100%)
    public boolean killauraRotate = true;           // rotate toward target
    public int killauraPriority = 0;                // 0=closest, 1=lowest hp, 2=highest hp
    public boolean killauraSwing = true;            // show swing animation
    public boolean killauraAutoSwitch = false;      // auto switch to best weapon
    public int killauraMaxTargets = 1;              // multi-aura targets

    // Keybind
    public int killauraToggleKey = 82; // R key by default

    public KillauraConfig() {
        this.configPath = FabricLoader.getInstance().getConfigDir().resolve("killaura-client.json");
    }

    public void load() {
        try {
            if (Files.exists(configPath)) {
                String json = Files.readString(configPath);
                KillauraConfig loaded = GSON.fromJson(json, KillauraConfig.class);
                copyFrom(loaded);
                KillauraClient.LOGGER.info("Config loaded from {}", configPath);
            }
        } catch (IOException e) {
            KillauraClient.LOGGER.error("Failed to load config", e);
        }
    }

    public void save() {
        try {
            Files.createDirectories(configPath.getParent());
            Files.writeString(configPath, GSON.toJson(this));
        } catch (IOException e) {
            KillauraClient.LOGGER.error("Failed to save config", e);
        }
    }

    private void copyFrom(KillauraConfig other) {
        this.killauraEnabled = other.killauraEnabled;
        this.killauraRange = other.killauraRange;
        this.killauraPlayersOnly = other.killauraPlayersOnly;
        this.killauraHostileOnly = other.killauraHostileOnly;
        this.killauraAnimalOnly = other.killauraAnimalOnly;
        this.killauraCooldownSync = other.killauraCooldownSync;
        this.killauraCooldownThreshold = other.killauraCooldownThreshold;
        this.killauraRotate = other.killauraRotate;
        this.killauraPriority = other.killauraPriority;
        this.killauraSwing = other.killauraSwing;
        this.killauraAutoSwitch = other.killauraAutoSwitch;
        this.killauraMaxTargets = other.killauraMaxTargets;
        this.killauraToggleKey = other.killauraToggleKey;
    }
}
