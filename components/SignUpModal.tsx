"use client";

export default function SignUpModal({
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
        <button
          onClick={closeModal}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-4 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-4 py-2"
          />
          <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition w-full">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}