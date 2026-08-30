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

    // Replace Dashboard specific cards
    content = content.replace(
        /bg-white border border-slate-200 rounded-xl/g,
        'bg-white border border-slate-200 border-t-4 border-t-[#0A2540] rounded-xl hover:shadow-lg transition-all duration-300 gov-card-interactive group'
    );
    
    // Add hover effects to all buttons
    content = content.replace(
        /hover:bg-slate-50/g,
        'hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300'
    );

    // Make table headers government style (Navy Blue with White/Saffron text)
    content = content.replace(
        /<thead className="bg-\[\#FAF8F5\] text-\[10px\] font-black text-slate-400 uppercase tracking-wider">/g,
        '<thead className="bg-[#0A2540] text-[10px] font-black text-slate-100 uppercase tracking-wider">'
    );
    
    // Make table rows have a left border on hover
    content = content.replace(
        /<tr key=\{([^}]+)\} className="hover:bg-slate-50 transition">/g,
        '<tr key={$1} className="hover:bg-slate-50 transition-colors duration-200 group border-l-4 border-l-transparent hover:border-l-[#FF9933]">'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${file}`);
});
