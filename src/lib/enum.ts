import {z} from "zod";

export async function getTypesEnum (ctx: any, model: string, withEmptyString?: boolean) {
  const types = await ctx.prisma[model].findMany();
  const symbols: string[] = types.map((t: { symbol: string; }) => t.symbol);
  if (withEmptyString) {
    symbols.push("");
  }
  return z.enum(symbols)
}
