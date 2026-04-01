package com.killaura.gui;

import com.killaura.KillauraClient;
import com.killaura.config.KillauraConfig;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.client.gui.widget.SliderWidget;
import net.minecraft.text.Text;

public class KillauraScreen extends Screen {

    private KillauraConfig config;
    private int centerX;
    private int panelTop;

    public KillauraScreen() {
        super(Text.literal("KillAura Settings"));
    }

    @Override
    protected void init() {
        config = KillauraClient.getInstance().getConfig();
        centerX = width / 2;
        panelTop = 40;

        int buttonWidth = 200;
        int buttonHeight = 20;
        int spacing = 24;
        int x = centerX - buttonWidth / 2;
        int y = panelTop;

        // Enable/Disable toggle
        addDrawableChild(ButtonWidget.builder(
                Text.literal("KillAura: " + (config.killauraEnabled ? "\u00a7aON" : "\u00a7cOFF")),
                btn -> {
                    config.killauraEnabled = !config.killauraEnabled;
                    btn.setMessage(Text.literal("KillAura: " + (config.killauraEnabled ? "\u00a7aON" : "\u00a7cOFF")));
                }
        ).dimensions(x, y, buttonWidth, buttonHeight).build());
        y += spacing;

        // Range slider
        addDrawableChild(new RangeSlider(x, y, buttonWidth, buttonHeight, config.killauraRange));
        y += spacing;

        // Cooldown threshold slider
        addDrawableChild(new CooldownSlider(x, y, buttonWidth, buttonHeight, config.killauraCooldownThreshold));
        y += spacing;

        // Cooldown sync toggle
        addDrawableChild(ButtonWidget.builder(
                Text.literal("Cooldown Sync: " + (config.killauraCooldownSync ? "\u00a7aON" : "\u00a7cOFF")),
                btn -> {
                    config.killauraCooldownSync = !config.killauraCooldownSync;
                    btn.setMessage(Text.literal("Cooldown Sync: " + (config.killauraCooldownSync ? "\u00a7aON" : "\u00a7cOFF")));
                }
        ).dimensions(x, y, buttonWidth, buttonHeight).build());
        y += spacing;

        // Rotate toggle
        addDrawableChild(ButtonWidget.builder(
                Text.literal("Rotate: " + (config.killauraRotate ? "\u00a7aON" : "\u00a7cOFF")),
                btn -> {
                    config.killauraRotate = !config.killauraRotate;
                    btn.setMessage(Text.literal("Rotate: " + (config.killauraRotate ? "\u00a7aON" : "\u00a7cOFF")));
                }
        ).dimensions(x, y, buttonWidth, buttonHeight).build());
        y += spacing;

        // Swing animation toggle
        addDrawableChild(ButtonWidget.builder(
                Text.literal("Swing Anim: " + (config.killauraSwing ? "\u00a7aON" : "\u00a7cOFF")),
                btn -> {
                    config.killauraSwing = !config.killauraSwing;
                    btn.setMessage(Text.literal("Swing Anim: " + (config.killauraSwing ? "\u00a7aON" : "\u00a7cOFF")));
                }
        ).dimensions(x, y, buttonWidth, buttonHeight).build());
        y += spacing;

        // Auto switch weapon
        addDrawableChild(ButtonWidget.builder(
                Text.literal("Auto Switch: " + (config.killauraAutoSwitch ? "\u00a7aON" : "\u00a7cOFF")),
                btn -> {
                    config.killauraAutoSwitch = !config.killauraAutoSwitch;
                    btn.setMessage(Text.literal("Auto Switch: " + (config.killauraAutoSwitch ? "\u00a7aON" : "\u00a7cOFF")));
                }
        ).dimensions(x, y, buttonWidth, buttonHeight).build());
        y += spacing;

        // Target priority
        addDrawableChild(ButtonWidget.builder(
                Text.literal("Priority: " + getPriorityName(config.killauraPriority)),
                btn -> {
                    config.killauraPriority = (config.killauraPriority + 1) % 3;
                    btn.setMessage(Text.literal("Priority: " + getPriorityName(config.killauraPriority)));
                }
        ).dimensions(x, y, buttonWidth, buttonHeight).build());
        y += spacing;

        // Target filter - Players Only
        addDrawableChild(ButtonWidget.builder(
                Text.literal("Players Only: " + (config.killauraPlayersOnly ? "\u00a7aON" : "\u00a7cOFF")),
                btn -> {
                    config.killauraPlayersOnly = !config.killauraPlayersOnly;
                    if (config.killauraPlayersOnly) {
                        config.killauraHostileOnly = false;
                        config.killauraAnimalOnly = false;
                    }
                    btn.setMessage(Text.literal("Players Only: " + (config.killauraPlayersOnly ? "\u00a7aON" : "\u00a7cOFF")));
                }
        ).dimensions(x, y, buttonWidth / 2 - 2, buttonHeight).build());

        // Target filter - Hostile Only
        addDrawableChild(ButtonWidget.builder(
                Text.literal("Hostile: " + (config.killauraHostileOnly ? "\u00a7aON" : "\u00a7cOFF")),
                btn -> {
                    config.killauraHostileOnly = !config.killauraHostileOnly;
                    if (config.killauraHostileOnly) {
                        config.killauraPlayersOnly = false;
                        config.killauraAnimalOnly = false;
                    }
                    btn.setMessage(Text.literal("Hostile: " + (config.killauraHostileOnly ? "\u00a7aON" : "\u00a7cOFF")));
                }
        ).dimensions(x + buttonWidth / 2 + 2, y, buttonWidth / 2 - 2, buttonHeight).build());
        y += spacing;

        // Max targets slider
        addDrawableChild(new MaxTargetsSlider(x, y, buttonWidth, buttonHeight, config.killauraMaxTargets));
        y += spacing + 8;

        // Save & Close button
        addDrawableChild(ButtonWidget.builder(
                Text.literal("\u00a7lSave & Close"),
                btn -> {
                    config.save();
                    close();
                }
        ).dimensions(x, y, buttonWidth, buttonHeight).build());
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        renderBackground(context, mouseX, mouseY, delta);

        // Title
        context.drawCenteredTextWithShadow(textRenderer,
                Text.literal("\u00a7b\u00a7lKillAura Client \u00a77- Settings"),
                centerX, 15, 0xFFFFFF);

        // Status indicator
        String status = config.killauraEnabled ? "\u00a7a[ACTIVE]" : "\u00a7c[INACTIVE]";
        context.drawCenteredTextWithShadow(textRenderer, Text.literal(status), centerX, 27, 0xFFFFFF);

        super.render(context, mouseX, mouseY, delta);
    }

    @Override
    public boolean shouldPause() {
        return false; // Don't pause the game
    }

    private String getPriorityName(int priority) {
        return switch (priority) {
            case 0 -> "\u00a7eClosest";
            case 1 -> "\u00a7cLowest HP";
            case 2 -> "\u00a7aHighest HP";
            default -> "Unknown";
        };
    }

    // --- Custom Sliders ---

    private class RangeSlider extends SliderWidget {
        public RangeSlider(int x, int y, int width, int height, double range) {
            super(x, y, width, height, Text.literal("Range: " + String.format("%.1f", range)), (range - 1.0) / 5.0);
        }

        @Override
        protected void updateMessage() {
            double range = 1.0 + this.value * 5.0;
            setMessage(Text.literal("Range: " + String.format("%.1f", range)));
        }

        @Override
        protected void applyValue() {
            config.killauraRange = 1.0 + this.value * 5.0;
        }
    }

    private class CooldownSlider extends SliderWidget {
        public CooldownSlider(int x, int y, int width, int height, float threshold) {
            super(x, y, width, height,
                    Text.literal("Cooldown: " + (int) (threshold * 100) + "%"),
                    threshold);
        }

        @Override
        protected void updateMessage() {
            setMessage(Text.literal("Cooldown: " + (int) (this.value * 100) + "%"));
        }

        @Override
        protected void applyValue() {
            config.killauraCooldownThreshold = (float) this.value;
        }
    }

    private class MaxTargetsSlider extends SliderWidget {
        public MaxTargetsSlider(int x, int y, int width, int height, int maxTargets) {
            super(x, y, width, height,
                    Text.literal("Max Targets: " + maxTargets),
                    (maxTargets - 1) / 9.0);
        }

        @Override
        protected void updateMessage() {
            int targets = (int) (1 + this.value * 9);
            setMessage(Text.literal("Max Targets: " + targets));
        }

        @Override
        protected void applyValue() {
            config.killauraMaxTargets = (int) (1 + this.value * 9);
        }
    }
}
