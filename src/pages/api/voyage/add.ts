import type { Vessel, Voyage } from "@prisma/client";
import type { NextApiHandler, NextApiResponse, NextApiRequest } from "next";
import { prisma } from "~/server/db";

export type ReturnType = (Voyage & { vessel: Vessel })[];

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<undefined>
) => {
  if (req.method === "PUT" || req.method === "GET") {
    console.log(`req`, req);
    const depart = 1704812400000;
    const arrive = 1704873600000;

    const createdVoyage = await prisma.voyage.create({
      data: {
        portOfDischarge: "Copenhagen",
        portOfLoading: "Oslo",
        scheduledDeparture: new Date(depart).toISOString(),
        scheduledArrival: new Date(arrive).toISOString(),
        vesselId: "clps1l18j0001103bi6z7tm68",
      },
      // where: {
      //   id: req.query.id as string,
      // },
      // ...req.body,
    });

    console.log(`createdVoyage`, createdVoyage);

    createdVoyage ? res.status(204) : res.status(404);
    res.end();
    return;
  }

  res.status(405).end();
};

export default handler;
