import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { SheetClose, SheetHeader, SheetTitle } from "~/components/ui/sheet";

export type NewVoyageFormValues = {
  portOfLoading: string;
  portOfDischarge: string;
  scheduledDeparture: number;
  scheduledArrival: number;
};

export const NewVoyageForm = () => {
  const [errors, setErrors] = useState<string[]>([]);

  const mutation = useMutation(
    async (values: NewVoyageFormValues) => {
      const { portOfDischarge, portOfLoading, scheduledArrival, scheduledDeparture } = values;

      const queryString = `portOfDischarge=${portOfDischarge}&portOfLoading=${portOfLoading}&scheduledArrival=${scheduledArrival}&scheduledDeparture=${scheduledDeparture}`;

      const response = await fetch(`/api/voyage/add?${queryString}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to create the voyage");
      }
    },
    {
      onSuccess: () => {
        // This is a hack, but "sheet" doesn't seem to export a way to close it programmatically:
        document.getElementById("cancelNewVoyage")?.click();
      },
    }
  );

  const handleCreate = (values: NewVoyageFormValues) => {
    mutation.mutate(values);
  };

  return (
    <SheetHeader>
      <SheetTitle>Crete new voyage</SheetTitle>

      <label htmlFor="portOfLoading">Port of loading</label>
      <input type="text" id="portOfLoading" name="portOfLoading" />

      <label htmlFor="portOfLoading">Port of discharge</label>
      <input type="text" id="portOfDischarge" name="portOfDischarge" />

      <label htmlFor="departure">Departure</label>
      <input type="datetime-local" id="scheduledDeparture" name="scheduledDeparture" />

      <label htmlFor="arrival">Arrival</label>
      <input type="datetime-local" id="scheduledArrival" name="scheduledArrival" />

      <div style={{ color: "red" }}>
        {errors.map((error) => (
          <p key={error}>{error}</p>
        ))}
      </div>

      <Button
        onClick={() => {
          const values = getValues();
          const errors = getFormErrors(values);
          errors ? setErrors(errors) : setErrors([]);
          if (!errors) handleCreate(values);
        }}
      >
        Submit
      </Button>
      <SheetClose style={{ width: "100%" }} id="cancelNewVoyage">
        {/* Not using Button component here, as I cannot nest a button within a button;
          it turns out that SheetClose is a button element. */}
        Cancel
      </SheetClose>
    </SheetHeader>
  );
};

/*
NB: I'm aware that 'react-query' or other libraries in this project 
may have form functionality and validation built-in 
- similar to Formik which I have used around 2 years ago. 
However, it was quicker for me to create my own in this case,
than to learn a new library.
*/

/** Get form values from DOM, quick and dirty */
const getValues = () => {
  const depStr = (document.getElementById("scheduledDeparture") as HTMLInputElement)?.value;
  const depUnix = new Date(depStr).valueOf();

  const arrStr = (document.getElementById("scheduledArrival") as HTMLInputElement)?.value;
  const arrUnix = new Date(arrStr).valueOf();

  const values: NewVoyageFormValues = {
    portOfLoading: (document.getElementById("portOfLoading") as HTMLInputElement)?.value,
    portOfDischarge: (document.getElementById("portOfDischarge") as HTMLInputElement)?.value,
    scheduledDeparture: depUnix,
    scheduledArrival: arrUnix,
  };

  return values;
};

/** Get form errors if any, otherwise return null */
const getFormErrors = (values: NewVoyageFormValues) => {
  const errors: string[] = [];

  if (!values.portOfLoading) {
    errors.push("Port of loading required");
  }

  if (!values.portOfDischarge) {
    errors.push("Port of discharge required");
  }

  if (!values.scheduledDeparture) {
    errors.push("Departure required");
  }

  if (!values.scheduledArrival) {
    errors.push("Arrival required");
  }

  if (values.scheduledArrival < values.scheduledDeparture) {
    errors.push("Arrival must be after departure");
  }

  return errors.length ? errors : null;
};
