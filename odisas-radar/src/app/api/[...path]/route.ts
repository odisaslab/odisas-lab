import { dispatch } from '@/server/api';

// Las tandas de investigación y el cron pueden tardar: se pide el máximo que permita el plan.
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ path: string[] }> };
const handler = async (req: Request, ctx: Ctx) => dispatch(req, (await ctx.params).path);

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
