export const ImportWizard = (): JSX.Element => {
  return (
    <section>
      <h3>Import Wizard</h3>
      <ol>
        <li>Select source</li>
        <li>Preview</li>
        <li>Map accounts</li>
        <li>Review duplicates</li>
        <li>Confirm + import</li>
      </ol>
      {/* TODO(impl): implement non-blocking step transitions with inline recovery messages for all failures. */}
    </section>
  );
};
