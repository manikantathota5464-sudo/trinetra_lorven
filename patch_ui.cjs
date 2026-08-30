const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const filesToPatch = [
    'AlertsIncidentsPage.tsx',
    'CitizenFeedbackPage.tsx',
    'DashboardPage.tsx',
    'LiveFeedsPage.tsx',
    'MapOverviewPage.tsx',
    'ReportsPage.tsx',
    'SystemSettingsPage.tsx',
    'TrafficRulesPage.tsx',
    'VehicleWatchListPage.tsx'
];

filesToPatch.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');

    // Make standard cards pop out with a top border and hover effect
    content = content.replace(
        /className="bg-white border border-\[\#E2E8F0\] rounded-2xl/g,
        'className="bg-white border-2 border-[#E2E8F0] border-t-4 border-t-[#0A2540] rounded-2xl gov-card-interactive hover:shadow-lg transition-all duration-300 group overflow-hidden relative'
    );

    // Make table headers government style (Navy Blue with White/Saffron text)
    content = content.replace(
        /<thead className="bg-\[\#FAF8F5\] text-\[10px\] font-black text-slate-400 uppercase tracking-wider">/g,
        '<thead className="bg-[#0A2540] text-[10px] font-black text-slate-100 uppercase tracking-wider">'
    );
    
    // Add border to th in thead
    content = content.replace(
        /<th className="px-6 py-3\.5">/g,
        '<th className="px-6 py-3.5 border-l border-slate-700/50">'
    );
    content = content.replace(
        /<th className="px-6 py-3\.5 text-center">/g,
        '<th className="px-6 py-3.5 border-l border-slate-700/50 text-center">'
    );

    // Make table rows have a left border on hover
    content = content.replace(
        /<tr key=\{([^}]+)\} className="hover:bg-slate-50 transition">/g,
        '<tr key={$1} className="hover:bg-slate-50 transition-colors duration-200 group border-l-4 border-l-transparent hover:border-l-[#FF9933]">'
    );

    // Increase font weights for metrics
    content = content.replace(
        /text-xl font-black/g,
        'text-3xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left'
    );
    content = content.replace(
        /text-2xl font-black/g,
        'text-4xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${file}`);
});
