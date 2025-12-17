"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  // --- REFS GENERALES ---
  const containerRef = useRef<HTMLDivElement>(null);
  const imagenRef = useRef<HTMLDivElement>(null);
  const textoRef = useRef<HTMLDivElement>(null);

  // --- REFS PARA LA INTRO (NUEVA ESTRUCTURA) ---
  const introMainContainerRef = useRef<HTMLDivElement>(null); // El contenedor fijo global
  const animatingShapeRef = useRef<HTMLDivElement>(null);     // El div que se encoge/agranda
  const blackContentRef = useRef<HTMLDivElement>(null);       // Capa negra con texto
  const videoRef = useRef<HTMLVideoElement>(null);            // Capa de video
  const introTextRef = useRef<HTMLHeadingElement>(null);      // El texto

  const collageRef = useRef<HTMLElement>(null);
  const videoSmall1 = useRef<HTMLDivElement>(null);
  const videoSmall2 = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);

  const cursorLabelRef = useRef<HTMLDivElement>(null);
  // Tipado correcto para evitar error 'any'
  const xTo = useRef<((value: number) => void) | null>(null);
  const yTo = useRef<((value: number) => void) | null>(null);
  // Estado para guardar el texto dinámico
  const [cursorText, setCursorText] = useState("");

  // --- ESTADO DEL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [dedicatoria, setDedicatoria] = useState("");

  // --- AUDIO ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };


  const openModal = (title: string, content: string) => {
    setDedicatoria(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Animación del Modal
  useGSAP(() => {
    if (isModalOpen) {
      gsap.to(modalContainerRef.current, { autoAlpha: 1, duration: 0.3 });
      gsap.fromTo(modalContentRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    } else {
      gsap.to(modalContainerRef.current, { autoAlpha: 0, duration: 0.3 });
      gsap.to(modalContentRef.current, { scale: 0.8, opacity: 0, y: 20, duration: 0.3 });
    }
  }, [isModalOpen]);



  // 2. Configuración del Movimiento del Cursor
  useGSAP(() => {
    // Centramos el div en el mouse usando GSAP en lugar de CSS
    gsap.set(cursorLabelRef.current, { xPercent: -50, yPercent: -50 });

    xTo.current = gsap.quickTo(cursorLabelRef.current, "x", { duration: 0.1, ease: "power3" });
    yTo.current = gsap.quickTo(cursorLabelRef.current, "y", { duration: 0.1, ease: "power3" });
  }, []);


  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);



  const enterCursorLabel = (text: string) => {
    setCursorText(text); // Cambia el texto
    gsap.to(cursorLabelRef.current, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
  };
  const moveCursorLabel = (e: React.MouseEvent) => {
    // Le pasamos las coordenadas del mouse (clientX/Y) a GSAP
    if (xTo.current && yTo.current) {
      xTo.current(e.clientX);
      yTo.current(e.clientY);
    }
  };

  const leaveCursorLabel = () => {
    gsap.to(cursorLabelRef.current, { scale: 0, opacity: 0, duration: 0.2 });
  };

  // --- LOGICA DE LA INTRO ---
  useGSAP(() => {
    // Asegurar que el video se reproduzca
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }

    if (!introTextRef.current) return;

    // Dividimos el texto
    const text = new SplitType(introTextRef.current, { types: 'chars' });
    const tl = gsap.timeline();

    tl
      // 1. Animamos el texto (Entrada)
      .from(text.chars, {
        y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out"
      })
      // 2. Animamos el texto (Salida)
      .to(text.chars, {
        y: -50, opacity: 0, duration: 0.5, stagger: 0.05, delay: 0.5
      })
      // 3. Movemos la capa negra un poco antes del "swap" para dar dinamismo
      .to(blackContentRef.current, {
        y: -50, opacity: 0, duration: 0.5, ease: "power2.in"
      })

      // --- AQUÍ OCURRE LA MAGIA DEL VIDEO ---

      // 4. Encogemos el contenedor (Shape) hasta hacerlo un cuadrado pequeño
      .to(animatingShapeRef.current, {
        scale: 0.25,         // Se encoge al 25% (Cuadrado en el centro)
        borderRadius: "30px", // Bordes redondeados
        border: "50px ", // El grosor y color del borde que quieras
        duration: 1.2,
        ease: "power3.inOut",
      }, "<") // "<" Empieza al mismo tiempo que se desvanece el texto/negro

      // 5. HACEMOS VISIBLE EL VIDEO (Swap)
      // Mientras se encoge, la capa negra (blackContentRef) ya bajó su opacidad en el paso 3,
      // revelando el video que está debajo.
      .to(videoRef.current, { opacity: 1, duration: 0.1 }, "-=0.5")

      // 6. Expandimos el video para llenar la pantalla (Efecto final)
      .to(animatingShapeRef.current, {
        scale: 1,           // Vuelve a pantalla completa
        borderRadius: "0px",
        backgroundColor: "#eee5deff", // Cambiamos el fondo al color de la página
        duration: 1.2,
        ease: "expo.inOut",
        delay: 0.2

      })



  });

  // --- LOGICA DEL RESTO DE LA PÁGINA ---
  useGSAP(() => {
    gsap.registerEffect({
      name: "bienvenidaEffect",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      effect: (targets: any, config: any) => {
        return gsap.timeline()
          .to(targets, { duration: config.duration, opacity: 1, y: -20, ease: 'back.out(1.7)' })
          .to(targets, { duration: 0.8, opacity: 0, y: -40, ease: 'power2.in', delay: 2 });
      },
      defaults: { duration: 1 },
      extendTimeline: true
    });

    // Ajustamos el delay para que empiece DESPUÉS de toda la intro (aprox 5 segs)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tl = gsap.timeline({ delay: 5.5 }) as any;
    tl.bienvenidaEffect(".box1");
  });

  useGSAP(() => {
    if (!imagenRef.current || !textoRef.current || !containerRef.current) return;
    gsap.to(imagenRef.current, {
      yPercent: -50, ease: "none",
      scrollTrigger: { trigger: containerRef.current, start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.from(textoRef.current, {
      rotation: -15, opacity: 0,
      scrollTrigger: { trigger: textoRef.current, start: "top 80%", end: "top 50%", scrub: 1 },
    });
  }, { scope: containerRef });

  useGSAP(() => {
    if (!collageRef.current) return;

    // El video de la izquierda sube más rápido (Parallax)
    gsap.to(videoSmall1.current, {
      y: -100, // Se mueve hacia arriba
      ease: "none",
      scrollTrigger: {
        trigger: collageRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    // El video de la derecha baja un poco
    gsap.to(videoSmall2.current, {
      y: 50,
      ease: "none",
      scrollTrigger: {
        trigger: collageRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    // La estrella gira
    gsap.to(starRef.current, {
      rotation: 360,
      scrollTrigger: {
        trigger: collageRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

  }, { scope: collageRef });

  return (

    <main style={{ overflow: "hidden", backgroundColor: "#eee5deff" }}>
      <section style={{ position: "relative", height: "100vh", width: "100%", backgroundColor: "#eee5deff" }}>
        {/* --- INTRO OVERLAY CON VIDEO --- */}
        <div
          ref={introMainContainerRef}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none", backgroundColor: "transparent", // Para que no bloquee clicks si algo falla
          }}
        >
          {/* Este es el DIV que cambia de tamaño (Shape) */}
          <div
            ref={animatingShapeRef}
            style={{
              position: "relative", width: "100%", height: "100%",
              backgroundColor: "#000", overflow: "hidden", // Crucial para recortar el video
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {/* CAPA 1: TEXTO + FONDO NEGRO (Encima del video) */}
            <div
              ref={blackContentRef}
              style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                backgroundColor: "#000", zIndex: 2,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <h1 ref={introTextRef} style={{ fontSize: "4rem", fontFamily: "serif", fontWeight: "lighter", color: "white" }}>
                CON MUCHO AMOR,


              </h1>
            </div>

            {/* CAPA 2: VIDEO (Debajo del negro) */}
            <video
              ref={videoRef}
              muted autoPlay loop playsInline
              src="/video.mp4" // <--- CAMBIA ESTO POR TU VIDEO
              style={{

                position: "absolute", width: "90%", height: "95%", borderRadius: "30px", backgroundColor: "#cdbdbdff",

                objectFit: "cover", zIndex: 1, opacity: 0, // Empieza invisible

              }}
            />
          </div>
        </div>
      </section>

      {/* --- SECCIÓN DEDICATORIA --- */}
      <section
        style={{
          minHeight: "60vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff",
          padding: "50px 20px",
          textAlign: "center"
        }}
      >
        <div style={{ maxWidth: "800px" }}>
          <h2 style={{
            fontSize: "3rem",
            fontFamily: "var(--font-oswald), sans-serif",
            marginBottom: "30px",
            color: "#111",
            textTransform: "uppercase",
            letterSpacing: "2px"
          }}>
            Para ti, Val
          </h2>
          <p style={{
            fontSize: "1.5rem",
            lineHeight: "1.8",
            color: "#444",
            fontFamily: "serif",
            fontStyle: "italic"
          }}>
            &quot;Dedicado con mucho amor para Valeria Diaz. Para que cada vez que entre a este sitio, pueda regresar en el tiempo y revivir cada mes conmigo.&quot;
          </p>
        </div>
      </section>

      {/* --- SECCIÓN 2: COLLAGE TIPO PARIS --- */}
      <section
        ref={collageRef}
        onMouseMove={moveCursorLabel} // <--- MUÉVELO AQUÍ (AL PADRE)
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            // --- PEGA ESTAS 3 LÍNEAS AQUÍ ---
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("MES DE LA PROPUESTA")}
            onClick={() => openModal("MES DE LA PROPUESTA", "Estaba tan confundido. \n\n  Me pasaba horas intentando entender lo que estaba sintiendo. No quería ilusionarme con alguien que en realidad no conocía. \n Yo sabía que ella era una buena chica por todo lo que me contaba Álvaro. Te conocí cada vez más y entendí que Dios puso en mi camino a la persona indicada para mí.  ")}
            // -------------------------------
            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none" // Agrega esto para ocultar la flecha normal
            }}
          >
            <img
              src="2.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "20%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/agua.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "10%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/salto.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("PRIMER MES JUNTOS")}
            onClick={() => openModal("PRIMER MES", "Nos conocimos mucho más \n\n Fue hermoso empezar las vacaciones con una persona tan especial como Valeria. \n Aprendí lo que es estar enamorado de una persona la cual te ama de la misma forma, nos conocimos mucho más y empezamos a entendernos profundamente. ")}
            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="water.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "63%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/walk.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "53%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/ppisao.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("SEGUNDO MES JUNTOS")}
            onClick={() => openModal("SEGUNDO MES", "Me esforcé mucho. \n\n Yo sabía que para Valeria, el 14 de Febrero era un día muy especial, así que hice todo lo posible para que sea un día inolvidable para ella, no quería defraudarla. \n Seguíamos en vacas y nos veíamos seguido, cada día que pasaba y te conocía más, me llenaba de felicidad y paz.")}
            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="pizza.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "40%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/lol.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "10%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/kiss.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "69%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/bon.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("TERCER MES JUNTOS")}
            onClick={() => openModal("TERCER MES", "Fue la que siempre estuvo ahí. \n\n Desde que estuve mal de la espalda. Ella fue la que me daba fuerzas y esperanzas para poder mejorarme, y así fue. \n Aprendimos nuevas cosas juntos en este mes y a pesar del poco tiempo que llevábamos nos amábamos como si lleváramos años juntos.")}
            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="monkey.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "57%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/holi.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "55%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/rana.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("CUARTO MES JUNTOS")}
            onClick={() => openModal("CUARTO MES", "Empezó la universidad. \n\n Estábamos nerviosos por todo lo nuevo que venía en la relación, ya que no sabíamos lo que era lidiar con los estudios y la distancia. \n Yo confiaba en ella y ella confiaba en mí.")}
            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="mini.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "20%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/xd2.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "10%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/besi.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("QUINTO MES JUNTOS")}
            onClick={() => openModal("QUINTO MES", "Un mes para aprender \n\n Tuvimos algunas discusiones, ya que la situación había cambiado a comparación de vacaciones. Ella siempre lo ha sido todo para mí, así que intenté mejorar todos los defectos que yo podía tener. Seguíamos juntos e intentando ser mejores cada día.")}
            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="cafe.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "20%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/linda.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "10%",  // Ajusta altura
              right: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/creppe.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "10%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/brea.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("SEXTO MES JUNTOS")}
            onClick={() => openModal("SEXTO MES", "El mes de mi cumpleaños \n\n En este mes me sentí amado de verdad, jamás en mi vida sentí a alguien que no fuera mi familia me amara tanto. Me regaló mi caseta del primer tricampeonato de la U. Un polo negrito de la U para vestir y un peluche de garrita. Me sentí la persona más afortunada del universo.")}
            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="lion.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "20%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/hola.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "10%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/wow.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("SEPTIMO MES JUNTOS")}
            onClick={() => openModal("SÉPTIMO MES", "Llegó el cumpleaños de Valeria \n\n Ya no estaba trabajando por lo que no podía darle un regalo tan grande. \nBusqué por todos lados la manera de hacerle algo lindo. Me hubiera gustado darle más pero era todo lo que podía dar en ese momento. Al final se lo di y le gustó mucho :) \n Vivimos más momentos bonitos juntos")}
            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="Q.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "20%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/choco.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "65%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/ella.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "15%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/XDD.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("OCTAVO MES JUNTOS")}
            onClick={() => openModal("OCTAVO MES", "Casi la misma situación. \n\n Ocho meses y seguíamos juntos como si hubiera pasado solo un mes, intentaba siempre alimentarla de cualquier manera ajaja, \n Siempre me ha encantado verla sonreír y ser feliz conmigo e iba a hacer lo posible para siempre verla así. ")}
            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="gym.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "20%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/LAMI.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "10%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/MINOVIA.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("NOVENO MES JUNTOS")}
            onClick={() => openModal("NOVENO MES", " Un nuevo reto para nosotros \n\n En este mes empecé a hacer mis prácticas pre profesionales. \n La rutina de nuestra relación cambió drásticamente en este mes, pero entendimos que era bueno, e hicimos todo lo posible para continuar felices. ")}

            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="FLOW.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "20%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/PROP.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "10%",  // Ajusta altura
              right: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/us.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "10%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/JIJI.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("DÉCIMO MES JUNTOS")}
            onClick={() => openModal("DÉCIMO MES", " Seguimos avanzando juntos \n\n Hacíamos todo lo posible para no perder la comunicación y darnos al menos un momento a la semana para poder vernos.\n Siempre queriendo enamorarla de cualquier manera  . ")}

            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="rico.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "20%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/osito.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "65%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/pose.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "15%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/aa.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>
      <section
        ref={collageRef}
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee5deff", // Color de fondo rosita/crema
          padding: "100px 0", // Espacio arriba y abajo
          overflow: "hidden"
        }}
      >
        {/* CONTENEDOR CENTRAL DEL COLLAGE */}
        <div style={{ position: "relative", width: "80%", maxWidth: "1000px", aspectRatio: "16/9" }}>

          {/* 1. VIDEO PRINCIPAL (GRANDE CENTRO) */}
          <div
            onMouseMove={moveCursorLabel}
            onMouseLeave={leaveCursorLabel}
            onMouseEnter={() => enterCursorLabel("ONCEAVO MES JUNTOS")}
            onClick={() => openModal("ONCEAVO MES", " Casi un año!! \n\n Fuimos al monumental por primera vez y tambien a ver a la U tricampeón en el monumental.\n Fue un mes en el cual fui muy feliz y pudimos compartir momentos duros pero también momentos hermosos. \n El tiempo se paso volando y realmente en ningun momento deje de amarla mucho. \n No quiero que esto jamás termine")}

            style={{
              width: "100%",
              height: "170%",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              cursor: "none"
            }}
          >
            <img
              src="u.jpeg"
              alt="Día de la propuesta"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 2. VIDEO FLOTANTE IZQUIERDA (Pequeño) */}
          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "17%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/jaja.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div
            ref={videoSmall1}
            style={{
              position: "absolute",
              top: "76%",  // Ajusta altura
              left: "-10%", // Lo sacamos un poco hacia la izquierda
              width: "250px", // Tamaño del video pequeño
              aspectRatio: "1/1", // Cuadrado
              borderRadius: "20px", overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2, // Encima del grande
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/cualroche.mp4" // <--- PON TU VIDEO PEQUEÑO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 3. VIDEO FLOTANTE DERECHA (Pequeño) */}
          <div
            ref={videoSmall2}
            style={{
              position: "absolute",
              bottom: "10%", // Lo ponemos más abajo
              right: "-5%",   // A la derecha
              width: "250px",
              aspectRatio: "1/1", // Un poco vertical
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
              zIndex: 2,
            }}
          >
            <video
              autoPlay muted loop playsInline
              src="/nini.mp4" // <--- PON TU OTRO VIDEO AQUÍ
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 4. ELEMENTO DECORATIVO (Estrella negra) */}
          <div
            ref={starRef}
            style={{
              position: "absolute",
              bottom: "10%",
              left: "-15%",
              fontSize: "4rem",
              color: "#111",
              zIndex: 0
            }}
          >
            ✦
          </div>

        </div>
      </section>

      {/* --- SECCIÓN FINAL: DEDICATORIA FINAL --- */}
      <section
        style={{
          minHeight: "60vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: "100px 20px",
          textAlign: "center"
        }}
      >
        <h2 style={{
          fontFamily: "var(--font-oswald), sans-serif",
          fontSize: "3rem",
          marginBottom: "40px",
          textTransform: "uppercase",
          color: "#111",
          letterSpacing: "4px"
        }}>
          FELICES DOCE MESES MI AMOR
        </h2>
        <div style={{
          fontFamily: "serif",
          fontSize: "1.5rem",
          lineHeight: "1.8",
          maxWidth: "800px",
          color: "#333",
          whiteSpace: "pre-line"
        }}>
          Gracias por buscar siempre lo mejor para mí. Hemos pasado momentos muy duros a lo largo de estos meses. Sé que es doloroso que las cosas hayan cambiado, pero es parte de la vida. Nos seguiremos amando, entendiéndonos y respetando porque somos 2 personas que han nacido para estar juntas. Te amo con todo mi corazón, nunca lo olvides.
          <div>
            Con todo mi amor, <strong>Hardidi.</strong>
          </div>

          {/* IMAGEN FINAL PEQUEÑA */}
          <div style={{
            marginTop: "40px",
            display: "flex",        // <--- Agregado
            justifyContent: "center"// <--- Agregado para centrar horizontalmente
          }}>
            <img
              src="/final.jpeg" // <--- CAMBIA ESTO POR TU IMAGEN
              alt="Despedida"
              style={{
                width: "110px", // Tamaño pequeño
                borderRadius: "15px",
              }}
            />
          </div>
        </div>
      </section>


      {/* --- PEGA ESTO AQUÍ AL FINAL (DENTRO DEL MAIN) --- */}
      <div
        ref={cursorLabelRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          // Estilo Moderno Glassmorphism
          backgroundColor: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          padding: "12px 24px",
          borderRadius: "50px",
          fontSize: "0.85rem",
          fontFamily: "var(--font-oswald), sans-serif",
          textTransform: "uppercase",
          letterSpacing: "2px",
          fontWeight: "500",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          scale: 0,
          transform: "translate(-50%, -50%)",
          whiteSpace: "nowrap",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
        }}
      >
        {cursorText}
      </div>

      {/* --- MODAL --- */}
      <div
        ref={modalContainerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(5px)",
          zIndex: 10000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          opacity: 0,
          visibility: "hidden"
        }}
        onClick={closeModal} // Close when clicking outside
      >
        <div
          ref={modalContentRef}
          style={{
            backgroundColor: "#fff",
            padding: "40px",
            borderRadius: "20px",
            maxWidth: "600px",
            width: "100%",
            position: "relative",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            opacity: 0,
            transform: "scale(0.8) translateY(20px)"
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#333"
            }}
          >
            ✕
          </button>
          <h3 style={{
            fontFamily: "var(--font-oswald), sans-serif",
            fontSize: "2rem",
            marginBottom: "20px",
            textTransform: "uppercase"
          }}>
            {dedicatoria}
          </h3>
          <p style={{
            fontFamily: "serif",
            fontSize: "1.2rem",
            lineHeight: "1.6",
            color: "#555",
            whiteSpace: "pre-line" // Allows newlines in text
          }}>
            {modalContent}
          </p>
        </div>
      </div>

      {/* --- AUDIO PLAYER --- */}
      <audio ref={audioRef} loop>
        <source src="/cancion.mp3" type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleAudio}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "#111",
          color: "#fff",
          border: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
          cursor: "pointer",
          zIndex: 10001,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "transform 0.2s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {isPlaying ? "❚❚" : "▶"}
      </button>

    </main>
  );
}