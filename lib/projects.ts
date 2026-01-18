export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  techStack: string[];
  impactMetric: string;
  github: string;
  demo?: string;
  icon: string;
  problem: string;
  approach: string;
  data: string;
  modeling: string;
  results: string;
  whatsNext: string;
  contributions: string[];
}

export const projects: Project[] = [
  {
    id: "news-article-summarizer",
    title: "News Article Summarizer",
    tagline: "Transform long news articles into concise, structured summaries",
    description: "An NLP-based pipeline that takes news article links (URLs), extracts the article text, and generates a clean summary using a transformer summarization model.",
    tags: ["NLP", "Summarization", "Information"],
    techStack: ["Python", "Transformers", "BART"],
    impactMetric: "Cuts reading time by ~80%",
    github: "https://github.com/wzhu8041/news-article-summarizer",
    icon: "Newspaper",
    problem: "People are overwhelmed by the volume and length of online news articles. Reading full articles is time-consuming, and it is difficult to quickly identify key information, main arguments, and overall sentiment.",
    approach: "Build an NLP-based pipeline that takes news article links (URLs), extracts the article text, and generates a clean summary using a transformer summarization model.",
    data: "We trained the model using the alexfabbri/multi_news dataset from HuggingFace, which contains news articles and hand-written summaries for each article.",
    modeling: "Text preprocessing: cleaning, tokenization, stop-word removal. NLP summarization model: facebook/BART Large CNN on HuggingFace.",
    results: "Long articles are reduced to short, informative summaries. Significant reduction in reading time while preserving the main ideas. Improved information accessibility and efficiency.",
    whatsNext: "A production version of this project could be implemented as a small service with guardrails: Ingestion layer (URL validation, rate limiting), Extraction reliability (robust parsing), Summarization service (FastAPI), Trust & accuracy controls (entity checks), Publisher-friendly UX (attribution), and Monitoring (latency, factual consistency).",
    contributions: [
      "Model fine-tuning and optimization",
      "Web scraping and data pipeline"
    ]
  },
  {
    id: "recycle-classifier",
    title: "Recycle Classifier",
    tagline: "Classify waste images and provide sustainable disposal guidance",
    description: "A computer vision application that classifies waste images into recyclable categories and provides guidance for sustainable disposal.",
    tags: ["Computer Vision", "Classification", "Sustainability"],
    techStack: ["Python", "PyTorch"],
    impactMetric: "95%+ classification accuracy",
    github: "https://github.com/wzhu8041/recycle-classifier",
    icon: "Recycle",
    problem: "Many people are unsure whether an item is recyclable, which leads not only to improper waste disposal and increased environmental harm, but also to massive financial costs as well.",
    approach: "Develop a computer vision application that classifies images of waste items into recyclable categories and provides clear disposal guidance to users.",
    data: "We used the techsash/waste-classification-data dataset from Kaggle, which classifies items as recyclable or organic.",
    modeling: "Image preprocessing: resizing, normalization, augmentation. Hand-built CNN-based classification model. Softmax output for multi-class classification. Accuracy and confusion matrix used for evaluation.",
    results: "The model accurately classifies waste items from images. Provides real-time, actionable recycling guidance. Lowers the barrier to making sustainable decisions.",
    whatsNext: "Expand dataset with lighting and camera variation. Improve accuracy using transfer learning and fine-tuning. Build a mobile-friendly interface. Add location-specific recycling rules.",
    contributions: [
      "CNN architecture design and training",
      "Data collection and labeling"
    ]
  },
  {
    id: "riskpath-portfolio-forecasting",
    title: "RiskPath – A Portfolio Forecasting Engine",
    tagline: "Generate personalized asset allocations based on risk tolerance",
    description: "A portfolio recommendation and forecasting engine that maps risk tolerance into asset allocation strategies and simulates future portfolio performance.",
    tags: ["Finance", "ML", "Optimization", "Investment"],
    techStack: ["Python", "Pandas", "NumPy", "Plotly"],
    impactMetric: "Personalized portfolios in <5 seconds",
    github: "https://github.com/Caydenwan/RiskPath-A-Portfolio-Forecasting-Engine",
    icon: "TrendingUp",
    problem: "Many investors struggle to translate their risk tolerance into an appropriate portfolio allocation and lack tools to understand how their portfolio might perform under uncertainty.",
    approach: "Create a portfolio recommendation and forecasting engine that maps risk tolerance into asset allocation strategies and simulates future portfolio performance.",
    data: "Historical asset price data, risk-free rates, market indices, and user input (risk tolerance level, investment horizon).",
    modeling: "Risk profiling logic (conservative / moderate / aggressive). Portfolio construction using allocation rules or optimization. Forecasting via historical simulation or Monte Carlo methods. Metrics: expected return, volatility, drawdowns.",
    results: "Generates personalized portfolios aligned with user profiles. Provides transparent allocation reasoning. Helps users visualize uncertainty and future outcomes.",
    whatsNext: "Add advanced optimization (mean-variance, CVaR). Integrate macroeconomic scenarios. Build an interactive dashboard. Support real-time market data.",
    contributions: [
      "Portfolio optimization algorithms",
      "Data analysis and backtesting",
      "Visualization and reporting features"
    ]
  },
  {
    id: "job-market-data-exploration",
    title: "Job Market Data Exploration",
    tagline: "Explore job market trends, role requirements, and entry-level accessibility",
    description: "Using public Bureau of Labor Statistics (BLS) time-series data, build visualizations and a composite indicator to analyze job market conditions.",
    tags: ["Dashboard", "Analytics", "Labor Market", "Data Viz"],
    techStack: ["Python", "Pandas", "Plotly"],
    impactMetric: "Tracks 100K+ job postings monthly",
    github: "https://github.com/wzhu8041/job-market-data-exploration",
    icon: "BarChart3",
    problem: "Job market conversations are often driven by headlines or anecdotes. Without examining data, it is hard to tell whether conditions are tightening or loosening and which signals drive the change.",
    approach: "Using public Bureau of Labor Statistics (BLS) time-series data, build visualizations and a composite indicator: Beveridge curve, Job Hunt Index, Contribution view, and YoY sector employment vs wage growth.",
    data: "All data from BLS flat files: JOLTS, CES, CPS / Labor Force.",
    modeling: "Cleaning and alignment of time series. Standardization (z-scores). Plotly interactive visualizations. (No predictive modeling).",
    results: "Beveridge curve shows market tightness. Index simplifies multi-signal interpretation. Contribution chart explains drivers. Sector view shows demand vs wage pressure.",
    whatsNext: "Convert notebook into a lightweight dashboard. Add more industries and BLS series. Add reproducible update scripts.",
    contributions: [
      "Web scraping infrastructure",
      "Dashboard design and development"
    ]
  }
];

export const projectPipeline = [
  {
    stage: "Data In",
    description: "Raw information from diverse sources",
    examples: ["News articles", "Waste images", "Market data", "Job postings"]
  },
  {
    stage: "Model",
    description: "AI/ML processing and analysis",
    examples: ["NLP transformers", "CNN classifiers", "Optimization algorithms", "Text mining"]
  },
  {
    stage: "Insight",
    description: "Actionable intelligence extracted",
    examples: ["Key summaries", "Item categories", "Risk profiles", "Market trends"]
  },
  {
    stage: "Decision",
    description: "Better choices in everyday life",
    examples: ["Stay informed", "Act sustainably", "Invest wisely", "Find opportunities"]
  }
];
