import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export type NewVoyageQueryPayload = {
  portOfLoading: string;
  portOfDischarge: string;
  scheduledDeparture: string;
  scheduledArrival: string;
};

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<undefined>) => {
  // Added 'GET' in order to debug in browser
  if (req.method === "PUT" || req.method === "GET") {
    const query = req.query as NewVoyageQueryPayload;
    const { portOfDischarge, portOfLoading, scheduledArrival, scheduledDeparture } = query;

    const vessel = await prisma.vessel.findFirst();

    const createdVoyage = await prisma.voyage.create({
      data: {
        portOfLoading,
        portOfDischarge,
        scheduledDeparture: new Date(parseInt(scheduledDeparture)).toISOString(),
        scheduledArrival: new Date(parseInt(scheduledArrival)).toISOString(),
        // Currently hardcoded to use same vessel each time to avoid further
        // complexity in this code challenge.
        vesselId: vessel?.id ?? "<DUMMY_ID>",
      },
    });

    createdVoyage ? res.status(204) : res.status(404);
    res.end();
    return;
  }

  res.status(405).end();
};

export default handler;
