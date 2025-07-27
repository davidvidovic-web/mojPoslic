'use client'

import { NextIntlClientProvider } from 'next-intl';
import { ConditionalHeader } from "@/components/core/conditional-header";
import { ConditionalFooter } from "@/components/core/conditional-footer";
import { useEffect, useState } from 'react';

// Static messages for auth pages to avoid server-side complications
const getAuthMessages = (locale: string = 'bs') => {
  if (locale === 'en') {
    return {
      auth: {
        signIn: "Sign In",
        signOut: "Sign Out", 
        register: "Register",
        email: "Email",
        enterEmail: "Enter your email",
        password: "Password",
        enterPassword: "Enter your password",
        signingIn: "Signing in...",
        dontHaveAccount: "Don't have an account?",
        signInToMojPoslic: "Sign In to mojPoslić",
        signInDescription: "Enter your credentials to access your account",
        signedInSuccessfully: "Signed in successfully!",
        signInFailed: "Sign in failed. Please try again.",
        createAccount: "Create Account",
        createAccountDescription: "Enter your email and password to create an account",
        creatingAccount: "Creating account...",
        alreadyHaveAccount: "Already have an account?",
        registerToMojPoslic: "Create your mojPoslić account",
        registerDescription: "Enter your details to create a new account",
        accountCreated: "Account created successfully!",
        checkEmailForVerification: "Please check your email for verification",
        registrationFailed: "Registration failed. Please try again.",
        registrationSuccessful: "Registration successful! Please check your email for verification.",
        userAlreadyExists: "User with this email already exists",
        passwordTooShort: "Password must be at least 6 characters",
        forgotPassword: "Forgot password?",
        continueWithGoogle: "Continue with Google",
        orContinueWith: "Or continue with",
        passwordStrength: "Password Strength",
        passwordRequirements: "Password Requirements:",
        meetAllCriteria: "Please meet all required criteria for a secure password",
        passwordStrengthLevels: {
          veryWeak: "Very Weak",
          weak: "Weak",
          fair: "Fair",
          good: "Good",
          strong: "Strong"
        },
        passwordRequirementLabels: {
          length: "At least 8 characters long",
          uppercase: "Contains uppercase letter (A-Z)",
          lowercase: "Contains lowercase letter (a-z)",
          number: "Contains number (0-9)",
          special: "Contains special character (!@#$%^&*)"
        }
      },
      header: {
        postJob: "Post Job",
        logo: "mojPoslić",
        menu: "Menu",
        close: "Close",
        profile: "Profile",
        account: "Account",
        preferences: "Preferences",
        help: "Help",
        support: "Support",
        feedback: "Feedback",
        about: "About",
        terms: "Terms of Service",
        privacy: "Privacy",
        cookies: "Cookies",
        language: "Language",
        theme: "Theme",
        notifications: "Notifications",
        search: "Search",
        searchPlaceholder: "Search jobs, companies...",
        browseJobs: "Browse Jobs",
        forEmployers: "For Employers",
        forJobSeekers: "For Job Seekers",
        pricing: "Pricing",
        contact: "Contact",
        blog: "Blog",
        careers: "Careers",
        press: "Press",
        partners: "Partners",
        developers: "Developers",
        api: "API",
        status: "Status",
        security: "Security",
        compliance: "Compliance",
        accessibility: "Accessibility",
        sitemap: "Sitemap",
        auth: {
          signIn: "Sign In",
          register: "Register"
        },
        languageSwitcher: {
          en: "EN",
          bs: "BS",
          switchTo: "Switch to {lang}"
        }
      },
      homepage: {
        footer: {
          description: "Connect with opportunities that match your skills and aspirations",
          forWorkers: {
            title: "For Workers",
            findJobs: "Find Jobs",
            dailyWork: "Daily Work",
            hourlyJobs: "Hourly Jobs"
          },
          forClients: {
            title: "For Clients",
            postJobs: "Post Job",
            findWorkers: "Find Workers",
            free: "Free"
          },
          services: {
            title: "Services",
            jobPosting: "Job Posting",
            candidateSearch: "Candidate Search",
            hiringTools: "Hiring Tools"
          },
          support: {
            title: "Support",
            helpCenter: "Help Center",
            contactSupport: "Contact Support",
            faq: "Frequently Asked Questions"
          },
          legal: {
            title: "Legal",
            privacyPolicy: "Privacy Policy",
            termsOfService: "Terms of Service",
            cookiePolicy: "Cookie Policy"
          },
          copyright: "© {year} mojPoslić. All rights reserved."
        }
      },
      navigation: {
        main: {},
        breadcrumb: {}
      }
    };
  }
  
  // Bosnian (default)
  return {
    auth: {
      signIn: "Prijavi se",
      signOut: "Odjavi se",
      register: "Registruj se", 
      email: "Email",
      enterEmail: "Unesite vaš email",
      password: "Lozinka",
      enterPassword: "Unesite vašu lozinku",
      signingIn: "Prijavljujem...",
      dontHaveAccount: "Nemate račun?",
      signInToMojPoslic: "Prijavite se na mojPoslić",
      signInDescription: "Unesite vaše podatke za pristup vašem računu",
      signedInSuccessfully: "Uspješno ste se prijavili!",
      signInFailed: "Prijava neuspješna. Molimo pokušajte ponovo.",
      createAccount: "Kreiraj račun",
      createAccountDescription: "Unesite vaš email i lozinku da kreirate račun",
      creatingAccount: "Kreiram račun...",
      alreadyHaveAccount: "Već imate račun?",
      registerToMojPoslic: "Kreirajte vaš mojPoslić račun",
      registerDescription: "Unesite vaše podatke za kreiranje novog računa",
      accountCreated: "Račun je uspješno kreiran!",
      checkEmailForVerification: "Molimo provjerite vaš email za verifikaciju",
      registrationFailed: "Registracija neuspješna. Molimo pokušajte ponovo.",
      registrationSuccessful: "Registracija uspješna! Molimo provjerite vaš email za verifikaciju.",
      userAlreadyExists: "Korisnik sa ovim email-om već postoji",
      passwordTooShort: "Lozinka mora imati najmanje 6 karaktera",
      forgotPassword: "Zaboravili ste lozinku?",
      continueWithGoogle: "Nastavi sa Google",
      orContinueWith: "Ili nastavi sa",
      passwordStrength: "Jačina lozinke",
      passwordRequirements: "Zahtjevi za lozinku:",
      meetAllCriteria: "Molimo ispunite sve potrebne kriterije za sigurnu lozinku",
      passwordStrengthLevels: {
        veryWeak: "Vrlo slaba",
        weak: "Slaba",
        fair: "Pristojne",
        good: "Dobra",
        strong: "Jaka"
      },
      passwordRequirementLabels: {
        length: "Najmanje 8 karaktera",
        uppercase: "Sadrži veliko slovo (A-Z)",
        lowercase: "Sadrži malo slovo (a-z)",
        number: "Sadrži broj (0-9)",
        special: "Sadrži poseban karakter (!@#$%^&*)"
      }
    },
    header: {
      postJob: "Objavi poslić",
      logo: "mojPoslić",
      menu: "Meni",
      close: "Zatvori",
      profile: "Profil",
      account: "Račun",
      preferences: "Preferencije",
      help: "Pomoć",
      support: "Podrška",
      feedback: "Povratne informacije",
      about: "O nama",
      terms: "Uslovi korištenja",
      privacy: "Privatnost",
      cookies: "Kolačići",
      language: "Jezik",
      theme: "Tema",
      notifications: "Obaveštenja",
      search: "Pretraga",
      searchPlaceholder: "Pretraži poslove, kompanije...",
      browseJobs: "Pregledaj Poslove",
      forEmployers: "Za Poslodavce",
      forJobSeekers: "Za Tragače za Posao",
      pricing: "Cijene",
      contact: "Kontakt",
      blog: "Blog",
      careers: "Karijera",
      press: "Mediji",
      partners: "Partneri",
      developers: "Programeri",
      api: "API",
      status: "Status",
      security: "Sigurnost",
      compliance: "Saglasnost",
      accessibility: "Pristupačnost",
      sitemap: "Mapa sajta",
      auth: {
        signIn: "Prijava",
        register: "Registracija"
      },
      languageSwitcher: {
        en: "EN",
        bs: "BS",
        switchTo: "Prebaci na {lang}"
      }
    },
    homepage: {
      footer: {
        description: "Povežite se s prilikama koje odgovaraju vašim vještinama i aspiracijama",
        forWorkers: {
          title: "Za radnike",
          findJobs: "Pronađi poslove",
          dailyWork: "Dnevni poslovi",
          hourlyJobs: "Poslovi po satu"
        },
        forClients: {
          title: "Za klijente",
          postJobs: "Objavi poslić",
          findWorkers: "Pronađi radnike",
          free: "Besplatno"
        },
        services: {
          title: "Usluge",
          jobPosting: "Objavljivanje poslova",
          candidateSearch: "Pretraga kandidata",
          hiringTools: "Alati za zapošljavanje"
        },
        support: {
          title: "Podrška",
          helpCenter: "Centar za pomoć",
          contactSupport: "Kontaktirajte podršku",
          faq: "Često postavljana pitanja"
        },
        legal: {
          title: "Pravno",
          privacyPolicy: "Politika privatnosti",
          termsOfService: "Uslovi korištenja",
          cookiePolicy: "Politika kolačića"
        },
        copyright: "© {year} mojPoslić. Sva prava zadržana."
      }
    },
    navigation: {
      main: {},
      breadcrumb: {}
    }
  };
};

interface AuthLayoutProps {
  children: React.ReactNode;
  locale?: string;
}

export function AuthLayout({ children, locale = 'bs' }: AuthLayoutProps) {
  const [messages, setMessages] = useState(getAuthMessages(locale));

  useEffect(() => {
    // Detect locale from browser or URL if needed
    const detectedLocale = 
      typeof window !== 'undefined' 
        ? (window.location.pathname.includes('/en') ? 'en' : 'bs')
        : locale;
    
    setMessages(getAuthMessages(detectedLocale));
  }, [locale]);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="relative flex min-h-screen flex-col">
        <ConditionalHeader />
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
        <ConditionalFooter />
      </div>
    </NextIntlClientProvider>
  );
}
