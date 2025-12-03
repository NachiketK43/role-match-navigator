"use client"

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ContainerProps {
    className?: string;
    children: React.ReactNode;
    delay?: number;
    reverse?: boolean;
    simple?: boolean;
}

const Container = ({ children, className, delay = 0.2, reverse, simple }: ContainerProps) => {
    return (
        <motion.div
            className={cn("w-full h-full", className)}
            initial={{ opacity: 0, y: reverse ? -20 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay, duration: simple ? 0.2 : 0.4, type: simple ? "keyframes" : "spring", stiffness: simple ? 100 : undefined }}
        >
            {children}
        </motion.div>
    )
};

export default function Footer() {
  return (
    <footer className="flex flex-col relative items-center justify-center border-t border-foreground/5 pt-16 pb-8 px-6 lg:px-8 w-full max-w-6xl mx-auto lg:pt-32">
      <div className="grid gap-8 xl:grid-cols-3 xl:gap-8 w-full">
        <Container>
          <div className="flex flex-col items-start justify-start md:max-w-[200px]">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">NH</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 text-sm text-start">
              Your AI-powered job search companion – streamline applications, optimize resumes, and land your dream role.
            </p>
          </div>
        </Container>

        <div className="grid-cols-2 gap-8 grid mt-16 xl:col-span-2 xl:mt-0">
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <Container delay={0.1} className="h-auto">
              <h3 className="text-base font-normal text-foreground">
                Features
              </h3>
              <ul className="mt-4 text-sm text-muted-foreground space-y-4">
                <li className="mt-2">
                  <Link to="/resume-optimizer" className="hover:text-foreground transition-all duration-300">
                    Resume Optimizer
                  </Link>
                </li>
                <li className="mt-2">
                  <Link to="/cover-letter" className="hover:text-foreground transition-all duration-300">
                    Cover Letter Generator
                  </Link>
                </li>
                <li className="mt-2">
                  <Link to="/application-tracker" className="hover:text-foreground transition-all duration-300">
                    Application Tracker
                  </Link>
                </li>
                <li className="mt-2">
                  <Link to="/practice-interview" className="hover:text-foreground transition-all duration-300">
                    Interview Practice
                  </Link>
                </li>
              </ul>
            </Container>
            <Container delay={0.2} className="h-auto">
              <div className="mt-10 md:mt-0 flex flex-col">
                <h3 className="text-base font-normal text-foreground">
                  Tools
                </h3>
                <ul className="mt-4 text-sm text-muted-foreground space-y-4">
                  <li>
                    <Link to="/networking-hub" className="hover:text-foreground transition-all duration-300">
                      Networking Hub
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link to="/dashboard" className="hover:text-foreground transition-all duration-300">
                      Dashboard
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link to="/profile" className="hover:text-foreground transition-all duration-300">
                      Profile
                    </Link>
                  </li>
                </ul>
              </div>
            </Container>
          </div>
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <Container delay={0.3} className="h-auto">
              <h3 className="text-base font-normal text-foreground">
                Resources
              </h3>
              <ul className="mt-4 text-sm text-muted-foreground space-y-4">
                <li className="mt-2">
                  <Link to="#" className="hover:text-foreground transition-all duration-300">
                    Documentation
                  </Link>
                </li>
                <li className="mt-2">
                  <Link to="#" className="hover:text-foreground transition-all duration-300">
                    Help Center
                  </Link>
                </li>
                <li className="mt-2">
                  <Link to="#" className="hover:text-foreground transition-all duration-300">
                    Career Tips
                  </Link>
                </li>
              </ul>
            </Container>
            <Container delay={0.4} className="h-auto">
              <div className="mt-10 md:mt-0 flex flex-col">
                <h3 className="text-base font-normal text-foreground">
                  Company
                </h3>
                <ul className="mt-4 text-sm text-muted-foreground space-y-4">
                  <li>
                    <Link to="#" className="hover:text-foreground transition-all duration-300">
                      About Us
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link to="#" className="hover:text-foreground transition-all duration-300">
                      Privacy Policy
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link to="#" className="hover:text-foreground transition-all duration-300">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </Container>
          </div>
        </div>
      </div>

      <Container delay={0.5} className="w-full relative mt-12 lg:mt-20">
        <div className="mt-8 md:flex md:items-center justify-center w-full">
          <p className="text-sm text-muted-foreground mt-8 md:mt-0">
            &copy; {new Date().getFullYear()} NextHire. Built for career excellence.
          </p>
        </div>
      </Container>
    </footer>
  );
}
