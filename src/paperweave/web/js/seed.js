/* PaperWeave — empty starter archive for the public portable build */
(function () {
  const PW = (window.PW = window.PW || {});

  function data() {
    return {
      version: 1,
      meta: {
        demo: false,
        demoDismissed: true,
        createdAt: new Date().toISOString(),
      },
      profile: {
        name: '我的研究',
        field: '',
        progressStages: [
          { id: 'todo', label: '未开始', percent: 0 },
          { id: 'skim', label: '泛读', percent: 20 },
          { id: 'deep', label: '精读', percent: 50 },
          { id: 'repro', label: '已复现', percent: 80 },
          { id: 'done', label: '已总结', percent: 100 },
        ],
      },
      papers: [],
      links: [],
      ideas: [],
    };
  }

  PW.seed = { data };
})();
