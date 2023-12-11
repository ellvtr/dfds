import type { Vessel, Voyage } from "@prisma/client";
import type { NextApiHandler, NextApiResponse } from "next";
import { prisma } from "~/server/db";

const handler: NextApiHandler = async (_, res: NextApiResponse<Vessel[]>) => {
  const vessels = await prisma.vessel.findMany();

  res.status(200).json(vessels);
};

export default handler;
