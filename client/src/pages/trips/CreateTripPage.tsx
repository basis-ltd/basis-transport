import { Heading } from '@/components/inputs/TextInputs';
import AppLayout from '@/containers/navigation/AppLayout';

const CreateTripPage = () => {
  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <ul className="w-full flex items-center gap-3 justify-between">
            <Heading>Create Trip</Heading>
          </ul>
        </nav>
      </main>
    </AppLayout>
  );
};

export default CreateTripPage;
