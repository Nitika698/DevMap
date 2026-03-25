import robo from "../assets/robo.jpeg";

function Hero() {
  return (
    <section className="flex items-center justify-between px-10 py-20">
      
      {/* Left Content */}
      <div className="max-w-lg">
        <h1 className="text-5xl font-bold">
          Your <span className="text-blue-600">Smart AI Guide</span>
        </h1>

        <p className="mt-6 text-gray-600">
          DevMap helps you build personalized learning roadmaps,
          track progress, and achieve your goals faster.
        </p>

        <div className="mt-6 space-x-4">
          <button className="px-6 py-2 border rounded">Log In</button>
          <button className="px-6 py-2 bg-blue-500 text-white rounded">
            Sign Up
          </button>
        </div>
      </div>

      {/* Right Image */}
      <img
        src={robo}
        alt="AI Robot"
        className="w-96 object-contain"
      />
    </section>
  );
}

export default Hero;