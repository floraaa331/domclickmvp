package com.killaura.module;

import com.killaura.KillauraClient;
import com.killaura.config.KillauraConfig;
import com.killaura.gui.GuiKeybindHandler;
import com.killaura.gui.KillauraHud;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import org.lwjgl.glfw.GLFW;

public class ModuleManager {
    private final KillAuraModule killAura;
    private KeyBinding toggleKey;

    public ModuleManager() {
        this.killAura = new KillAuraModule();

        // Register toggle keybind
        toggleKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
                "Toggle KillAura",
                InputUtil.Type.KEYSYM,
                GLFW.GLFW_KEY_R,
                "KillAura Client"
        ));

        // Register GUI keybind
        new GuiKeybindHandler();

        // Register HUD overlay
        new KillauraHud().register();

        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            if (toggleKey.wasPressed()) {
                KillauraConfig config = KillauraClient.getInstance().getConfig();
                config.killauraEnabled = !config.killauraEnabled;
                config.save();
            }

            killAura.onTick(client);
        });
    }

    public KillAuraModule getKillAura() {
        return killAura;
    }
}
