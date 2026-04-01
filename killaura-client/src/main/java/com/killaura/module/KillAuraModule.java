package com.killaura.module;

import com.killaura.KillauraClient;
import com.killaura.config.KillauraConfig;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.ClientPlayerEntity;
import net.minecraft.entity.Entity;
import net.minecraft.entity.LivingEntity;
import net.minecraft.entity.mob.HostileEntity;
import net.minecraft.entity.passive.AnimalEntity;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.item.AxeItem;
import net.minecraft.item.SwordItem;
import net.minecraft.util.Hand;
import net.minecraft.util.math.MathHelper;
import net.minecraft.util.math.Vec3d;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class KillAuraModule {

    private Entity currentTarget;

    public void onTick(MinecraftClient client) {
        KillauraConfig config = KillauraClient.getInstance().getConfig();

        if (!config.killauraEnabled || client.player == null || client.world == null) {
            currentTarget = null;
            return;
        }

        ClientPlayerEntity player = client.player;

        // Check attack cooldown - vanilla Minecraft 1.21.4 style
        // getAttackCooldownProgress(0.5f) returns 0.0-1.0, where 1.0 = fully charged
        if (config.killauraCooldownSync) {
            float cooldown = player.getAttackCooldownProgress(0.5f);
            if (cooldown < config.killauraCooldownThreshold) {
                return; // Wait for cooldown
            }
        }

        // Find valid targets
        List<LivingEntity> targets = findTargets(client, player, config);

        if (targets.isEmpty()) {
            currentTarget = null;
            return;
        }

        // Sort based on priority
        sortTargets(targets, player, config);

        // Attack targets (up to maxTargets)
        int attacked = 0;
        for (LivingEntity target : targets) {
            if (attacked >= config.killauraMaxTargets) break;

            // Auto switch to best weapon
            if (config.killauraAutoSwitch) {
                switchToBestWeapon(player);
            }

            // Rotate toward target
            if (config.killauraRotate) {
                rotateToward(player, target);
            }

            // Attack
            if (config.killauraSwing) {
                player.swingHand(Hand.MAIN_HAND);
            }

            client.interactionManager.attackEntity(player, target);
            currentTarget = target;
            attacked++;
        }
    }

    private List<LivingEntity> findTargets(MinecraftClient client, ClientPlayerEntity player, KillauraConfig config) {
        List<LivingEntity> targets = new ArrayList<>();
        double rangeSq = config.killauraRange * config.killauraRange;

        for (Entity entity : client.world.getEntities()) {
            if (!(entity instanceof LivingEntity living)) continue;
            if (entity == player) continue;
            if (!living.isAlive()) continue;
            if (living.isInvisible()) continue;

            double distSq = player.squaredDistanceTo(entity);
            if (distSq > rangeSq) continue;

            // Target filtering
            if (config.killauraPlayersOnly && !(entity instanceof PlayerEntity)) continue;
            if (config.killauraHostileOnly && !(entity instanceof HostileEntity)) continue;
            if (config.killauraAnimalOnly && !(entity instanceof AnimalEntity)) continue;

            // Don't attack creative/spectator players
            if (entity instanceof PlayerEntity targetPlayer) {
                if (targetPlayer.isCreative() || targetPlayer.isSpectator()) continue;
            }

            targets.add(living);
        }

        return targets;
    }

    private void sortTargets(List<LivingEntity> targets, ClientPlayerEntity player, KillauraConfig config) {
        switch (config.killauraPriority) {
            case 0 -> // Closest
                    targets.sort(Comparator.comparingDouble(e -> e.squaredDistanceTo(player)));
            case 1 -> // Lowest HP
                    targets.sort(Comparator.comparingDouble(LivingEntity::getHealth));
            case 2 -> // Highest HP
                    targets.sort(Comparator.comparingDouble(e -> -e.getHealth()));
        }
    }

    private void rotateToward(ClientPlayerEntity player, Entity target) {
        Vec3d targetPos = target.getPos().add(0, target.getEyeHeight(target.getPose()) / 2.0, 0);
        Vec3d playerPos = player.getEyePos();

        double dx = targetPos.x - playerPos.x;
        double dy = targetPos.y - playerPos.y;
        double dz = targetPos.z - playerPos.z;

        double dist = Math.sqrt(dx * dx + dz * dz);
        float yaw = (float) Math.toDegrees(Math.atan2(dz, dx)) - 90.0f;
        float pitch = (float) -Math.toDegrees(Math.atan2(dy, dist));

        player.setYaw(yaw);
        player.setPitch(MathHelper.clamp(pitch, -90.0f, 90.0f));
    }

    private void switchToBestWeapon(ClientPlayerEntity player) {
        int bestSlot = -1;
        float bestDamage = 0;

        for (int i = 0; i < 9; i++) {
            var stack = player.getInventory().getStack(i);
            if (stack.getItem() instanceof SwordItem sword) {
                float damage = sword.getMaterial().getAttackDamage();
                if (damage > bestDamage) {
                    bestDamage = damage;
                    bestSlot = i;
                }
            } else if (stack.getItem() instanceof AxeItem axe) {
                float damage = axe.getMaterial().getAttackDamage();
                if (damage > bestDamage) {
                    bestDamage = damage;
                    bestSlot = i;
                }
            }
        }

        if (bestSlot != -1) {
            player.getInventory().selectedSlot = bestSlot;
        }
    }

    public Entity getCurrentTarget() {
        return currentTarget;
    }
}
