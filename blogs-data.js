const BLOGS_DATA = [
  {
    id: "vit-robust-framework",
    title: "ViT-RoT: Robust Tomato Leaf Disease Recognition using Vision Transformers",
    date: "June 10, 2025",
    keywords: ["Vision Transformers", "Deep Learning", "AgriEngineering", "Computer Vision"],
    thumbnail: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&q=80",
    excerpt: "Exploring the robustness of Vision Transformers (ViTs) compared to traditional CNNs for automated plant disease classification in diverse lighting and background conditions.",
    youtubeId: "dcrg03t-pSU",
    images: [
      "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600&q=80",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80"
    ],
    content: [
      "In modern agriculture, automated disease detection is key to preventing massive crop failures. While Convolutional Neural Networks (CNNs) have long been the gold standard for computer vision tasks in plant pathology, they often struggle with generalization when deployed in the wild. Real-world farms present diverse environments, showing varying lighting conditions, background clutter, and camera angles that differ significantly from clean lab training datasets.",
      "To address this challenge, our recent research introduces <strong>ViT-RoT</strong> (Vision Transformer-Based Robust Framework). By utilizing self-attention mechanisms, Vision Transformers process images as sequences of patches. This global context representation allows them to focus on structural features of tomato leaf lesions rather than local background pixel patterns, offering far superior robustness.",
      "During our testing phases, we evaluated ViT-RoT against standard ResNet and EfficientNet architectures under synthetically degraded environments (simulating blur, heavy shadows, and low-light noise). The experimental results demonstrated that while CNN accuracy dropped by over 18% under severe noise, ViT-RoT retained an impressive accuracy of 92.4%, showing only a minor 3.2% performance decay.",
      "Implementing ViT architectures for edge devices in smart greenhouses, however, requires careful optimization. Because standard ViTs lack inductive bias, they require larger datasets to train from scratch. In our pipeline, we leveraged transfer learning using pre-trained weights from ImageNet-21k, followed by extensive fine-tuning with the PlantVillage dataset augmented with localized regional leaf diseases.",
      "The paper, published in <em>MDPI AgriEngineering</em>, represents a massive step toward robust, hands-free computer vision deployment in vertical farming and autonomous greenhouses, paving the way for real-time robotic sorting and leaf classification."
    ],
    references: [
      { text: "ViT-RoT Publication on MDPI AgriEngineering", url: "https://www.mdpi.com/2624-7402/7/6/185" },
      { text: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (arXiv)", url: "https://arxiv.org/abs/2010.11929" },
      { text: "PlantVillage Dataset - Tomato Leaf Diseases on Kaggle", url: "https://www.kaggle.com/datasets/emmarex/plantdisease" }
    ]
  },
  {
    id: "smart-iv-retrofit",
    title: "Building an IoT-Enabled Closed-Loop Controller for Gravity-Fed IV Drips",
    date: "April 02, 2026",
    keywords: ["IoT", "ESP32", "Medical Devices", "C++", "Hardware Design"],
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    excerpt: "How we retrofitted standard gravity IV drips with an ESP32, an infrared drop sensor, and a stepper motor clamp to build a low-cost closed-loop volumetric infusion pump.",
    youtubeId: "h47DFd0qi9A",
    images: [
      "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&q=80",
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80"
    ],
    content: [
      "In low-resource clinical settings, volumetric infusion pumps are an expensive luxury. Most wards rely on manual gravity-fed intravenous (IV) drip clamps. However, manual clamps are prone to drift due to cold flow of the plastic tubing, temperature shifts, and patient movement, risking under-infusion or fatal over-infusion.",
      "As our 3rd-year engineering project, we designed a non-invasive, clamp-on retrofit controller for standard IV sets. The device implements a closed-loop PID control loop powered by an ESP32 microcontroller. The control loop continuously measures the flow rate via an infrared drop counter attached to the drip chamber and adjusts the flow using a custom stepper-motor-driven mechanical squeezer clamp.",
      "The hardware stack consists of an ESP32-WROOM-32E module, an A4988 stepper driver, a high-torque NEMA 11 stepper motor, and a slotted optical switch infrared pair. We designed a custom 3D-printed enclosure that clips easily onto standard IV poles, ensuring that the device never touches the medical fluid directly, thereby preserving full sterilization.",
      "On the software side, the C++ firmware running on ESP32 utilizes hardware interrupts to measure the time delta between drop detection pulses. The PID algorithm computes the error against the target mL/hr rate set by the nurse and drives the stepper motor forward or backward to fine-tune the tubing compression. Additionally, the device publishes live telemetry—such as remaining volume, active flow rate, and battery status—to a central nursing station via MQTT over Wi-Fi.",
      "Our prototypes demonstrated excellent regulation, keeping the flow rate within a ±4% deviation margin over an 8-hour testing cycle, compared to manual gravity sets which fluctuated by up to 25%. This low-cost solution bridges the safety gap for standard wards without requiring expensive replacements of standard clinical infrastructure."
    ],
    references: [
      { text: "Smart IV Retrofit Controller Source Repository (GitHub)", url: "https://github.com/cepdnaclk/e21-3yp-Smart-IV" },
      { text: "Design of Low-Cost Closed-Loop Infusion Pumps (ResearchGate)", url: "https://www.researchgate.net/" },
      { text: "ESP32 Hardware Interrupts Tutorial", url: "https://randomnerdtutorials.com/esp32-external-interrupts-arduino-ide/" }
    ]
  },
  {
    id: "kanakku-offline-ledger",
    title: "Offline-First Mobile Architecture: Building Kanakku with Flutter & SQLite",
    date: "March 18, 2026",
    keywords: ["Flutter", "Dart", "SQLite", "App Architecture", "Offline-First"],
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
    excerpt: "A deep dive into building Kanakku, a minimalist offline-first mobile app for tracking shared expenses, ledger records, and active subscriptions with clean repositories.",
    youtubeId: "xV13Esu6eZ0",
    images: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80"
    ],
    content: [
      "When building utility apps like expense managers, speed and reliability are paramount. Users want to log an expense in milliseconds without staring at a loading spinner. If the app requires an active internet connection to authenticate and sync before saving, the user experience falls apart. This is why I designed <strong>Kanakku</strong> with an offline-first architecture.",
      "Kanakku is a cross-platform Flutter application built to manage shared group expenses and subscription cycles locally on the device. Instead of connecting directly to an API, the UI interacts exclusively with a local database layer using SQLite, handled through a robust database management wrapper.",
      "The application layer relies on the Repository Pattern. We isolate the data retrieval logic from the UI widgets. The `ExpenseRepository` fetches and saves records to the local database, while the state is managed via the BLoC (Business Logic Component) pattern. This guarantees that UI rendering remains completely decoupled from disk I/O.",
      "By storing the data locally, the app launches instantly and supports complete offline entry. Data schema migrations are managed cleanly inside the SQLite bootstrapper, allowing updates to active subscription entities without corrupting previous expense ledgers.",
      "Building offline-first requires careful planning around data schemas. Since transactions are created locally, we avoid auto-incrementing integer IDs which create sync conflicts in multi-user environments. Instead, every local record is initialized with a cryptographically secure UUID (Universally Unique Identifier). This ensures that if the ledger is shared or synced in the future, records merge seamlessly without indexing errors."
    ],
    references: [
      { text: "Kanakku Project Repository (GitHub)", url: "https://github.com/pavindranvelalagan/kanakku" },
      { text: "Flutter Architecture Guidelines & Best Practices", url: "https://flutter.dev/docs/development/data-and-backend/state-mgmt/intro" },
      { text: "Sqflite Database Package Documentation", url: "https://pub.dev/packages/sqflite" }
    ]
  },
  {
    id: "gemini-budget-bot",
    title: "Building NexEvent's AI Budget Bot: Integrating Gemini API with Fastify",
    date: "January 20, 2026",
    keywords: ["LLMs", "Fastify", "React", "Google Gemini API", "API Design"],
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    excerpt: "Integrating a secure Node.js backend with Google Gemini's structured output API to provide automated, context-aware financial suggestions for event planning.",
    youtubeId: "v8w8eXoA_qU",
    images: [
      "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=600&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80"
    ],
    content: [
      "Organizing large-scale events is a logistical nightmare, especially when it comes to budgeting. For <strong>NexEvent</strong>—our event management system—we wanted to go beyond simple spreadsheet tables. We wanted to build an intelligent assistant that could review expense forecasts, point out anomalies, and automatically suggest savings.",
      "To achieve this, we developed the **AI Budget Bot**, a full-stack integration connecting a React frontend to a Fastify (Node.js) server, which securely communicates with the Google Gemini 1.5 Flash API.",
      "A primary challenge of utilizing Large Language Models (LLMs) in software systems is enforcing reliable structured JSON outputs. If the model responds with plain English text instead of structured data, our frontend parsers will crash. We solved this by using the Gemini API's `responseSchema` configuration. By passing a rigid JSON schema, we force Gemini to output a perfectly shaped JSON object.",
      "The Fastify route handler acts as a secure proxy. The frontend sends the current event's category, guest count, and current budget breakdown. The backend validates this payload with a Zod schema, constructs a system instruction template, adds the user's data as context, and executes the Gemini request.",
      "Through prompt engineering, we instructed the model to evaluate the budget under specific logical rules: checking if catering represents more than 40% of the total, suggesting decor substitutions, and calculating emergency cash buffers. The React client receives this clean JSON response and renders customized analytics widgets, giving organizers clear and immediate optimization targets."
    ],
    references: [
      { text: "NexEvent Project Source Monorepo (GitHub)", url: "https://github.com/pavindranvelalagan/NexEvent_Event_Management_System" },
      { text: "Google Gemini Structured Outputs Developer Documentation", url: "https://ai.google.dev/gemini-api/docs/structured-outputs" },
      { text: "Fastify Framework Benchmarks & Architecture", url: "https://fastify.dev/" }
    ]
  }
];
