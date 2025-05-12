import Navbar from "../components/Navbar"
import Hero from "../components/Home/Hero"
import About from "../components/Home/About"
import FeaturedMenu from "../components/Home/FeaturedMenu"
import HowItWorks from "../components/Home/HowItWorks"
import CTA from "../components/Home/CallToAction"
import Footer from "../components/Home/Footer"

const Home = () => {
  return (
    <div>
        <Navbar />
        <Hero />
        <About />
        <FeaturedMenu />
        <HowItWorks />
        <CTA />
        <Footer />
    </div>
  )
}

export default Home
