import { getAllEntries, getDomains, getRegions } from "@/lib/data";
import { EntryCard } from "@/components/EntryCard";

export default function DirectoryPage() {
  const entries = getAllEntries();
  const domains = getDomains();
  const regions = getRegions();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Directory</h1>
        <p className="mt-2 text-text-muted">
          All {entries.length} organisations. Filter by domain, region, or tag.
        </p>
      </div>

      <div
        id="directory-root"
        data-entries={JSON.stringify(entries)}
        data-domains={JSON.stringify(domains)}
        data-regions={JSON.stringify(regions)}
      />

      <ul
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        id="entry-list"
      >
        {entries.map((entry) => (
          <EntryCard key={entry.slug} {...entry} />
        ))}
      </ul>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Client-side filtering and pagination
            (function() {
              var entries = JSON.parse(document.getElementById('directory-root').dataset.entries);
              var domains = JSON.parse(document.getElementById('directory-root').dataset.domains);
              var regions = JSON.parse(document.getElementById('directory-root').dataset.regions);
              var PER_PAGE = 20;
              var currentPage = 1;
              var list = document.getElementById('entry-list');
              var cards = Array.from(list.querySelectorAll('li'));
              
              // Build filter bar
              var bar = document.createElement('div');
              bar.className = 'flex flex-wrap gap-3 mb-4';
              bar.innerHTML = '<input type="search" id="dir-search" placeholder="Search '+entries.length+' organisations..." class="w-full sm:flex-1 min-w-[200px] rounded-lg border border-border bg-surface px-3 py-2 text-sm" />' +
                '<select id="dir-domain" class="w-full sm:w-auto rounded-lg border border-border bg-surface px-3 py-2 text-sm"><option value="">All domains</option>'+domains.map(function(d){return '<option value="'+d.key+'">'+d.label+' ('+d.count+')</option>'}).join('')+'</select>' +
                '<select id="dir-region" class="w-full sm:w-auto rounded-lg border border-border bg-surface px-3 py-2 text-sm"><option value="">All regions</option>'+regions.map(function(r){return '<option value="'+r.slug+'">'+r.name+' ('+r.count+')</option>'}).join('')+'</select>' +
                '<div class="flex flex-wrap gap-x-3 gap-y-1 text-xs">' +
                  '<label class="cursor-pointer"><input type="checkbox" id="f-contributors"> Contributors</label>' +
                  '<label class="cursor-pointer"><input type="checkbox" id="f-careers"> Careers page</label>' +
                  '<label class="cursor-pointer"><input type="checkbox" id="f-remote"> Remote</label>' +
                  '<label class="cursor-pointer"><input type="checkbox" id="f-github"> GitHub</label>' +
                  '<label class="cursor-pointer"><input type="checkbox" id="f-linkedin"> LinkedIn</label>' +
                  '<label class="cursor-pointer"><input type="checkbox" id="f-community"> Community</label>' +
                  '<label class="cursor-pointer"><input type="checkbox" id="f-events"> Events</label>' +
                  '<select id="f-decade" class="rounded border border-border bg-surface px-2 py-0.5 text-xs"><option value="">Any decade</option><option value="pre-2000">Pre-2000s</option><option value="2000s">2000s</option><option value="2010s">2010s</option><option value="2020s">2020s</option></select>' +
                '</div>' +
                '<div id="dir-pagination" class="flex items-center gap-2 ml-auto"></div>';
              list.parentNode.insertBefore(bar, list);

              function filter() {
                var q = (document.getElementById('dir-search').value||'').toLowerCase();
                var dom = document.getElementById('dir-domain').value;
                var reg = document.getElementById('dir-region').value;
                var contributors = document.getElementById('f-contributors').checked;
                var careers = document.getElementById('f-careers').checked;
                var remote = document.getElementById('f-remote').checked;
                var github = document.getElementById('f-github').checked;
                var linkedin = document.getElementById('f-linkedin').checked;
                var community = document.getElementById('f-community').checked;
                var events = document.getElementById('f-events').checked;
                var decade = document.getElementById('f-decade').value;
                var visible = cards.filter(function(c) {
                  if (q && c.textContent.toLowerCase().indexOf(q)===-1) return false;
                  if (dom && c.getAttribute('data-domain')!==dom) return false;
                  if (reg && c.getAttribute('data-region')!==reg) return false;
                  if (contributors && c.getAttribute('data-contributors')!=='true') return false;
                  if (careers && c.getAttribute('data-careers')!=='true') return false;
                  if (remote && c.getAttribute('data-tags').indexOf('remote')===-1) return false;
                  if (github && c.getAttribute('data-github')!=='true') return false;
                  if (linkedin && c.getAttribute('data-linkedin')!=='true') return false;
                  if (community && c.getAttribute('data-community')!=='true') return false;
                  if (events && c.getAttribute('data-events')!=='true') return false;
                  if (decade) {
                    var fy = parseInt(c.getAttribute('data-founded'))||0;
                    if (decade==='pre-2000' && (fy>=2000||fy===0)) return false;
                    if (decade==='2000s' && (fy<2000||fy>=2010)) return false;
                    if (decade==='2010s' && (fy<2010||fy>=2020)) return false;
                    if (decade==='2020s' && fy<2020) return false;
                  }
                  return true;
                });
                currentPage = 1;
                renderPage(visible);
              }

              function renderPage(visible) {
                var totalPages = Math.ceil(visible.length/PER_PAGE)||1;
                if (currentPage>totalPages) currentPage=totalPages;
                cards.forEach(function(c,i){
                  var page = Math.floor(i/PER_PAGE)+1;
                  var v = visible.includes(c);
                  c.style.display = (v && page===currentPage) ? '' : 'none';
                });
                var pag = document.getElementById('dir-pagination');
                pag.innerHTML = visible.length<=PER_PAGE ? '' :
                  '<button onclick="currentPage=Math.max(1,currentPage-1);filter()" class="rounded-lg border border-border px-3 py-1 text-sm" '+(currentPage<=1?'disabled':'')+'>← Prev</button>' +
                  '<span class="text-sm text-text-muted">'+currentPage+'/'+totalPages+'</span>' +
                  '<button onclick="currentPage=Math.min('+totalPages+',currentPage+1);filter()" class="rounded-lg border border-border px-3 py-1 text-sm" '+(currentPage>=totalPages?'disabled':'')+'>Next →</button>';
              }

              document.getElementById('dir-search').addEventListener('input',filter);
              document.getElementById('dir-domain').addEventListener('change',filter);
              document.getElementById('dir-region').addEventListener('change',filter);

              // Read query params on load
              var params = new URLSearchParams(window.location.search);
              var qp = params.get('q') || '';
              var dp = params.get('domain') || '';
              var rp = params.get('region') || '';
              if (qp) document.getElementById('dir-search').value = qp;
              if (dp) document.getElementById('dir-domain').value = dp;
              if (rp) document.getElementById('dir-region').value = rp;
              if (qp || dp || rp) filter();
            })();
          `,
        }}
      />
    </main>
  );
}
