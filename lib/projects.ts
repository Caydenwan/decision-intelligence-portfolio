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
    description: "An NLP-powered system that transforms long news articles into concise, structured summaries, enabling users to quickly extract key information and reduce information overload.",
    tags: ["NLP", "Summarization", "Information"],
    techStack: ["Python", "Transformers", "BERT", "Streamlit", "spaCy"],
    impactMetric: "Cuts reading time by ~80%",
    github: "https://github.com/wzhu8041/news-article-summarizer",
    icon: "Newspaper",
    problem: "In today's information-saturated world, professionals and students struggle to keep up with relevant news across multiple sources. Reading full articles is time-consuming, and missing important information can lead to poor decisions.",
    approach: "We built an extractive and abstractive summarization pipeline using transformer models. The system processes article URLs or raw text, extracts key entities and topics, generates concise summaries, and provides sentiment scoring to help users quickly gauge tone and importance.",
    data: "Training data includes news articles from diverse sources spanning politics, technology, business, and science. We utilized publicly available datasets and custom-sourced articles to build a comprehensive training corpus.",
    modeling: "We fine-tuned transformer models for abstractive summarization, combined with extractive techniques using sentence embeddings. Sentiment analysis leverages pre-trained models fine-tuned on news sentiment datasets. The hybrid approach balances accuracy and speed.",
    results: "The system achieves strong performance on standard benchmarks with high user satisfaction in testing. Average processing time is efficient for real-time use. Users report significant time savings and improved comprehension of complex topics.",
    whatsNext: "Future enhancements include multi-document summarization for topic tracking, personalized summary length based on user preferences, integration with RSS feeds for automated briefings, and support for non-English languages.",
    contributions: [
      "Model fine-tuning and optimization",
      "Web scraping and data pipeline",
      "Frontend development and UX design",
      "Sentiment analysis integration"
    ]
  },
  {
    id: "recycle-classifier",
    title: "Recycle Classifier",
    tagline: "Classify waste images and provide sustainable disposal guidance",
    description: "A computer vision application that classifies waste images into recyclable categories and provides guidance for sustainable disposal.",
    tags: ["Computer Vision", "Classification", "Sustainability"],
    techStack: ["Python", "PyTorch", "ResNet", "FastAPI", "React Native"],
    impactMetric: "95%+ classification accuracy",
    github: "https://github.com/wzhu8041/recycle-classifier",
    icon: "Recycle",
    problem: "Recycling confusion leads to contamination of recycling streams and increased landfill waste. Many people want to recycle correctly but lack clear, immediate guidance on how to dispose of specific items, especially when recycling rules vary by location.",
    approach: "We developed a convolutional neural network trained on thousands of waste item images. Users snap a photo of an item, and the model classifies it into categories (plastic, paper, metal, glass, organic, e-waste, hazardous) and provides disposal instructions tailored to general recycling guidelines.",
    data: "Our dataset comprises labeled images of common household waste items collected from public datasets and crowdsourced contributions. Images include various lighting conditions, angles, and backgrounds to ensure robust real-world performance.",
    modeling: "We use a ResNet-based architecture pre-trained on ImageNet, then fine-tuned on our waste classification dataset. Data augmentation techniques improve generalization. The model is optimized for mobile deployment using ONNX runtime.",
    results: "The classifier achieves high accuracy on held-out test data, with particularly strong performance on common waste categories. Mobile inference runs efficiently on modern smartphones. User studies show users find the guidance clear and actionable.",
    whatsNext: "Planned improvements include location-based recycling rules, barcode scanning for product-specific guidance, gamification features to encourage consistent use, and partnerships with municipal waste management programs for localized accuracy.",
    contributions: [
      "CNN architecture design and training",
      "Mobile app development",
      "Data collection and labeling",
      "API backend and deployment"
    ]
  },
  {
    id: "riskpath-portfolio-forecasting",
    title: "RiskPath – A Portfolio Forecasting Engine",
    tagline: "Generate personalized asset allocations based on risk tolerance",
    description: "A portfolio recommendation and forecasting engine that generates personalized asset allocations based on risk tolerance and projects future performance under uncertainty.",
    tags: ["Finance", "ML", "Optimization", "Investment"],
    techStack: ["Python", "Scikit-learn", "Pandas", "NumPy", "Plotly", "Streamlit"],
    impactMetric: "Personalized portfolios in <5 seconds",
    github: "https://github.com/Caydenwan/RiskPath-A-Portfolio-Forecasting-Engine",
    icon: "TrendingUp",
    problem: "Individual investors often struggle to build diversified portfolios aligned with their risk tolerance and financial goals. Traditional financial advisors are expensive and inaccessible to many, while generic online advice fails to account for personal circumstances and preferences.",
    approach: "We created an ML system that assesses user risk tolerance through a questionnaire, then applies modern portfolio theory and optimization algorithms to recommend asset allocations across stocks, bonds, real estate, and alternative investments. The system explains trade-offs between risk and expected returns.",
    data: "Historical asset class returns sourced from major financial data providers. We incorporate volatility metrics, correlation matrices, and scenario analysis data covering multiple market cycles including recessions and bull markets.",
    modeling: "The recommendation engine uses mean-variance optimization with constraints based on risk scores. We employ Monte Carlo simulation to project portfolio outcomes over different time horizons. A decision tree classifier maps risk profiles to allocation templates, refined through backtesting.",
    results: "Backtesting shows recommended portfolios achieve strong risk-adjusted returns compared to naive strategies. User testing indicates high satisfaction with recommendations, and users report better understanding of risk-return trade-offs after using the tool.",
    whatsNext: "Future development includes tax-loss harvesting suggestions, ESG-focused portfolio options, integration with brokerage APIs for automated rebalancing, and machine learning to adapt recommendations based on changing market conditions.",
    contributions: [
      "Portfolio optimization algorithms",
      "Risk assessment questionnaire design",
      "Data analysis and backtesting",
      "Visualization and reporting features"
    ]
  },
  {
    id: "job-market-data-exploration",
    title: "Job Market Data Exploration",
    tagline: "Explore job market trends, role requirements, and entry-level accessibility",
    description: "A data analytics project that explores job market trends, role requirements, and entry-level accessibility to help candidates make more informed career decisions.",
    tags: ["Dashboard", "Analytics", "Labor Market", "Data Viz"],
    techStack: ["Python", "Pandas", "Plotly", "Dash", "BeautifulSoup", "PostgreSQL"],
    impactMetric: "Tracks 100K+ job postings monthly",
    github: "https://github.com/wzhu8041/job-market-data-exploration",
    icon: "BarChart3",
    problem: "Entry-level job seekers face a frustrating paradox: positions labeled 'entry-level' increasingly require years of experience. Without market intelligence, candidates waste time applying to unsuitable roles and miss genuinely accessible opportunities. Transparency is lacking in hiring trends.",
    approach: "We built a web scraping and analytics pipeline that collects job postings from major platforms, extracts requirements using NLP, and calculates metrics like entry-level ratio, experience inflation scores, and hiring velocity. The interactive dashboard allows filtering by industry, location, and role type.",
    data: "Our database contains millions of job postings scraped from major job platforms. We track job titles, required experience, salary ranges, location, company size, and posting duration. Historical data enables trend analysis across time.",
    modeling: "Text mining techniques extract experience requirements from job descriptions. We calculate metrics combining factors like required years of experience, education requirements, and keyword analysis. Time-series models identify seasonal hiring patterns.",
    results: "The analysis reveals insights into entry-level job market accessibility across different industries and roles. Users report significant improvements in their job search strategy and reduced time spent on unsuitable applications.",
    whatsNext: "Planned features include salary fairness scoring adjusted for cost of living, company culture ratings integration, predictive models for job seeker success rates, email alerts for matching opportunities, and expansion to international markets.",
    contributions: [
      "Web scraping infrastructure",
      "NLP for requirement extraction",
      "Dashboard design and development",
      "Database architecture and optimization"
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
