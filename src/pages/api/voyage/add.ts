import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export type NewVoyageQueryPayload = {
  portOfLoading: string;
  portOfDischarge: string;
  scheduledDeparture: string;
  scheduledArrival: string;
};

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<undefined>
) => {
  // Added 'GET' in order to debug in browser
  if (req.method === "PUT" || req.method === "GET") {
    const query = req.query as NewVoyageQueryPayload;
    const {
      portOfDischarge,
      portOfLoading,
      scheduledArrival,
      scheduledDeparture,
    } = query;

    const createdVoyage = await prisma.voyage.create({
      data: {
        portOfLoading,
        portOfDischarge,
        scheduledDeparture: new Date(Number(scheduledDeparture)).toISOString(),
        scheduledArrival: new Date(Number(scheduledArrival)).toISOString(),
        // Currently hardcoded 'vesselId' to avoid further complexity in this code challenge.
        // However, this fails after `npm run db:reset` because the vesselId's change.
        // Workaround: Open the sqllite db and find a valid vesselId and replace the one below.
        vesselId: "clpwk1j0z0001wrm1u3ip2fyi",
      },
    });

    createdVoyage ? res.status(204) : res.status(404);
    res.end();
    return;
  }

  res.status(405).end();
};

export default handler;
