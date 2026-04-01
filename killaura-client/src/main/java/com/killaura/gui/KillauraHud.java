package com.killaura.gui;

import com.killaura.KillauraClient;
import com.killaura.config.KillauraConfig;
import com.killaura.module.KillAuraModule;
import net.fabricmc.fabric.api.client.rendering.v1.HudRenderCallback;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.entity.Entity;
import net.minecraft.entity.LivingEntity;
import net.minecraft.client.render.RenderTickCounter;

public class KillauraHud implements HudRenderCallback {

    public void register() {
        HudRenderCallback.EVENT.register(this);
    }

    @Override
    public void onHudRender(DrawContext context, RenderTickCounter tickCounter) {
        MinecraftClient client = MinecraftClient.getInstance();
        if (client.player == null || client.options.hudHidden) return;

        KillauraConfig config = KillauraClient.getInstance().getConfig();
        KillAuraModule killAura = KillauraClient.getInstance().getModuleManager().getKillAura();

        int x = 4;
        int y = 4;

        // Module status
        if (config.killauraEnabled) {
            context.drawTextWithShadow(client.textRenderer,
                    "\u00a7b[KillAura] \u00a7aACTIVE", x, y, 0xFFFFFF);
            y += 12;

            // Range info
            context.drawTextWithShadow(client.textRenderer,
                    "\u00a77Range: \u00a7f" + String.format("%.1f", config.killauraRange), x, y, 0xFFFFFF);
            y += 10;

            // Cooldown info
            float cooldown = client.player.getAttackCooldownProgress(0.5f);
            String cooldownColor = cooldown >= config.killauraCooldownThreshold ? "\u00a7a" : "\u00a7c";
            context.drawTextWithShadow(client.textRenderer,
                    "\u00a77Cooldown: " + cooldownColor + (int) (cooldown * 100) + "%", x, y, 0xFFFFFF);
            y += 10;

            // Target info
            Entity target = killAura.getCurrentTarget();
            if (target instanceof LivingEntity living) {
                String name = target.getName().getString();
                context.drawTextWithShadow(client.textRenderer,
                        "\u00a77Target: \u00a7e" + name, x, y, 0xFFFFFF);
                y += 10;
                context.drawTextWithShadow(client.textRenderer,
                        "\u00a77HP: \u00a7c" + String.format("%.1f", living.getHealth()) + " \u00a77/ \u00a7a" +
                                String.format("%.1f", living.getMaxHealth()), x, y, 0xFFFFFF);
                y += 10;
                context.drawTextWithShadow(client.textRenderer,
                        "\u00a77Dist: \u00a7f" + String.format("%.1f", Math.sqrt(client.player.squaredDistanceTo(target))),
                        x, y, 0xFFFFFF);
            } else {
                context.drawTextWithShadow(client.textRenderer,
                        "\u00a77Target: \u00a78None", x, y, 0xFFFFFF);
            }
        } else {
            context.drawTextWithShadow(client.textRenderer,
                    "\u00a7b[KillAura] \u00a7cOFF", x, y, 0xFFFFFF);
        }
    }
}
