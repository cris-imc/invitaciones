"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS, formatPrice, type PlanTier } from "@/lib/plan-limits";
import { 
  Sparkles, 
  Check, 
  X, 
  Crown, 
  Star,
  TrendingUp,
  Users,
  Image as ImageIcon,
  MessageCircle
} from "lucide-react";
import Link from "next/link";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [invitationStats, setInvitationStats] = useState({
    activeCount: 0,
    totalGuests: 0,
  });

  const userPlanTier = (session?.user?.planTier || "FREE") as PlanTier;
  const currentPlan = PLAN_LIMITS[userPlanTier];

  useEffect(() => {
    // Fetch user stats
    fetch("/api/invitations")
      .then((res) => res.json())
      .then((invitations) => {
        const activeCount = invitations.filter((inv: any) => inv.estado === "ACTIVA").length;
        const totalGuests = invitations.reduce((sum: number, inv: any) => {
          return sum + (inv._count?.guests || 0);
        }, 0);
        
        setInvitationStats({ activeCount, totalGuests });
      })
      .catch(console.error);
  }, []);

  const plans: PlanTier[] = ["FREE", "PREMIUM", "DIAMOND"];

  return (
    <div className="min-h-dvh bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tu Suscripción
          </h1>
          <p className="text-xl text-gray-600">
            Gestiona tu plan y mira tus límites
          </p>
        </div>

        {/* Current Plan Status */}
        <Card className="p-8 mb-12 bg-white shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  Plan {currentPlan.name}
                </h2>
                {userPlanTier === "PREMIUM" && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {userPlanTier === "DIAMOND" && (
                  <Badge className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Diamond
                  </Badge>
                )}
                {userPlanTier === "ENTERPRISE" && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Enterprise
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {formatPrice(currentPlan.price)}
                {currentPlan.price > 0 && <span className="text-sm text-gray-500 ml-2">/ evento</span>}
              </p>
            </div>

            {(userPlanTier === "PREMIUM" || userPlanTier === "DIAMOND") && (
              <Link href={`https://wa.me/5493517660000?text=${encodeURIComponent(`Hola! Necesito soporte con mi plan ${currentPlan.name}`)}`} target="_blank">
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Soporte WhatsApp
                </Button>
              </Link>
            )}
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Invitaciones Activas</span>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {invitationStats.activeCount}
                {currentPlan.maxInvitations !== null && (
                  <span className="text-lg text-gray-500 ml-2">
                    / {currentPlan.maxInvitations}
                  </span>
                )}
              </div>
              {currentPlan.maxInvitations === null && (
                <p className="text-sm text-green-600 mt-1">Ilimitadas ✨</p>
              )}
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Invitados Totales</span>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {invitationStats.totalGuests}
                {currentPlan.maxGuests !== null && (
                  <span className="text-lg text-gray-500 ml-2">
                    / {currentPlan.maxGuests}
                  </span>
                )}
              </div>
              {currentPlan.maxGuests === null && (
                <p className="text-sm text-green-600 mt-1">Ilimitados ✨</p>
              )}
            </div>

            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Fotos por Álbum</span>
                <ImageIcon className="w-5 h-5 text-pink-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {currentPlan.maxPhotos === null ? "∞" : currentPlan.maxPhotos}
              </div>
              {currentPlan.maxPhotos === null && (
                <p className="text-sm text-green-600 mt-1">Ilimitadas ✨</p>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(currentPlan.features).map(([key, enabled]) => (
              <div key={key} className="flex items-center gap-2">
                {enabled ? (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={enabled ? "text-gray-700" : "text-gray-400"}>
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Upgrade Options */}
        {userPlanTier !== "ENTERPRISE" && userPlanTier !== "ADMIN" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {userPlanTier === "FREE" ? "Actualiza tu Plan" : "Mejora Aún Más"}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((planKey) => {
                const plan = PLAN_LIMITS[planKey];
                const isCurrent = planKey === userPlanTier;
                const isUpgrade = plans.indexOf(planKey) > plans.indexOf(userPlanTier);

                return (
                  <Card
                    key={planKey}
                    className={`p-8 ${
                      isCurrent
                        ? "border-2 border-purple-500 shadow-xl"
                        : isUpgrade
                        ? "hover:shadow-xl transition-shadow"
                        : "opacity-60"
                    } ${planKey === "DIAMOND" ? "relative" : ""}`}
                  >
                    {planKey === "DIAMOND" && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white px-6 py-1 rounded-full text-sm font-semibold">
                        Recomendado
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-4xl font-bold text-purple-600">
                        {formatPrice(plan.price)}
                      </p>
                      {plan.price > 0 && (
                        <p className="text-sm text-gray-500 mt-1">pago único</p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>
                          {plan.maxInvitations === null
                            ? "Invitaciones ilimitadas"
                            : `Hasta ${plan.maxInvitations} invitación${plan.maxInvitations > 1 ? "es" : ""}`}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>
                          {plan.maxGuests === null
                            ? "Invitados ilimitados"
                            : `Hasta ${plan.maxGuests} invitados`}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        {plan.features.customMusic ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span>Música personalizada</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {plan.features.sharedAlbum ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span>Álbum colaborativo</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {plan.features.noWatermark ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span>Sin marca de agua</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {plan.features.live ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300" />
                        )}
                        <span>Modo Live (fotos en vivo)</span>
                      </li>
                    </ul>

                    {isCurrent ? (
                      <Button disabled className="w-full">
                        Plan Actual
                      </Button>
                    ) : isUpgrade ? (
                      <div className="space-y-3">
                        <Button
                          disabled
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          Próximamente - Mercado Pago
                        </Button>
                        {planKey === "DIAMOND" && (
                          <p className="text-xs text-center text-gray-500">
                            Pago disponible pronto
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button disabled variant="outline" className="w-full">
                        Plan Anterior
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
