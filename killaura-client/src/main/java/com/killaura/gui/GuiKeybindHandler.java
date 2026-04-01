package com.killaura.gui;

import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import org.lwjgl.glfw.GLFW;

public class GuiKeybindHandler {
    private final KeyBinding openGuiKey;

    public GuiKeybindHandler() {
        openGuiKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
                "Open KillAura GUI",
                InputUtil.Type.KEYSYM,
                GLFW.GLFW_KEY_RIGHT_SHIFT,
                "KillAura Client"
        ));

        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            if (openGuiKey.wasPressed() && client.currentScreen == null) {
                client.setScreen(new KillauraScreen());
            }
        });
    }
}
