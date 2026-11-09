// Page-specific navigation matches the supplied desktop design.
document.querySelector('.nav-links').innerHTML = `
 <li><a href="free-tools.html">Free tools</a></li>
 <li><a href="news.html">News</a></li>
 <li><span>Blog</span></li>
 <li><a href="my-ai-team.html">My AI Team</a></li>
 <li><a href="ai-customer-service.html" class="active" aria-current="page">AI Customer Service</a></li>
 <li><span>AI Presales Agent</span></li>
 <li><span>AI Listing</span></li>
 <li><span>Creator Outreach</span></li>
 <li class="nav-separator" aria-hidden="true"></li>
 <li><span>Help Center</span></li>`;
const language = document.createElement('span');
language.className = 'nav-language';
language.textContent = 'EN ⌄';
document.querySelector('.nav-actions').prepend(language);
