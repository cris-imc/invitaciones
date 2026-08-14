## Error Type
Runtime PrismaClientInitializationError

## Error Message

Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique()` invocation in
C:\Users\crmartinez\OneDrive - Prisma Medios de Pago\Escritorio\invitaciones\.next\dev\server\chunks\ssr\[root-of-the-server]__0k9gitf._.js:166:154

  163 const userId = session.user.id;
  164 const role = session.user.role;
  165 const userName = (session.user.name ?? "").split(" ")[0] || "anfitrión";
→ 166 const dbUser = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique(
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
  -->  schema.prisma:7
   | 
 6 |   provider = "postgresql"
 7 |   url      = env("DATABASE_URL")
   | 

Validation Error Count: 1


    at <unknown> (src\app\dashboard\page.tsx:112:36)
    at <unknown> (-->  schema.prisma:7:null)
    at  DashboardPage (src\app\dashboard\page.tsx:112:18)

## Code Frame
  110 |   const userName = (session.user.name ?? "").split(" ")[0] || "anfitrión";
  111 |
> 112 |   const dbUser = await prisma.user.findUnique({
      |                                    ^
  113 |     where: { id: userId },
  114 |     select: { planTier: true, premiumCredits: true, diamondCredits: true },
  115 |   });

Next.js version: 16.3.0 (Turbopack)
