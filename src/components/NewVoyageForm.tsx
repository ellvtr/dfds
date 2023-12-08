import { useState } from "react";
import { Button } from "~/components/ui/button";
import { SheetHeader, SheetTitle } from "~/components/ui/sheet";

export const NewVoyageForm = () => {
  const [errors, setErrors] = useState<string[]>([]);

  return (
    <SheetHeader>
      <SheetTitle>Crete new voyage</SheetTitle>

      <label htmlFor="portOfLoading">Port of loading</label>
      <input type="text" id="portOfLoading" name="portOfLoading" />

      <label htmlFor="portOfLoading">Port of discharge</label>
      <input type="text" id="portOfDischarge" name="portOfDischarge" />

      <label htmlFor="departure">Departure</label>
      <input
        type="datetime-local"
        id="scheduledDeparture"
        name="scheduledDeparture"
      />

      <label htmlFor="arrival">Arrival</label>
      <input
        type="datetime-local"
        id="scheduledArrival"
        name="scheduledArrival"
      />

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
        }}
        variant="outline"
      >
        Submit
      </Button>
    </SheetHeader>
  );
};

export type NewVoyageFormValues = {
  portOfLoading: string;
  portOfDischarge: string;
  scheduledDeparture: number;
  scheduledArrival: number;
};

const getValues = () => {
  const depStr = (
    document.getElementById("scheduledDeparture") as HTMLInputElement
  )?.value;
  const depUnix = new Date(depStr).valueOf();

  const arrStr = (
    document.getElementById("scheduledArrival") as HTMLInputElement
  )?.value;
  const arrUnix = new Date(arrStr).valueOf();

  const values: NewVoyageFormValues = {
    portOfLoading: (
      document.getElementById("portOfLoading") as HTMLInputElement
    )?.value,
    portOfDischarge: (
      document.getElementById("portOfDischarge") as HTMLInputElement
    )?.value,
    scheduledDeparture: depUnix,
    scheduledArrival: arrUnix,
  };

  // console.log(`values`, values);
  return values;
};

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
