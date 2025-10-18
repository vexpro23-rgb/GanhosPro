import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {

    useEffect(() => {
        const revealElements = document.querySelectorAll('.reveal');

        const revealOnScroll = () => {
            const windowHeight = window.innerHeight;
            
            revealElements.forEach(el => {
                const elementTop = el.getBoundingClientRect().top;
                const elementVisible = 150;

                if (elementTop < windowHeight - elementVisible) {
                    el.classList.add('visible');
                }
            });
        };

        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll();

        return () => window.removeEventListener('scroll', revealOnScroll);
    }, []);

    return (
        <div className="landing-page">
            <header className="hero">
                <div className="container hero-content">
                    <div className="hero-text">
                        <div className="logo">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L1 16v1c0 .6.4 1 1 1h2"/><path d="M7 16l-4 1"/><path d="M10 16h4"/><path d="m19 17-4 1"/><path d="M5 11l1.5-3h6L14 11"/><path d="M12 11V7"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>
                            <h1>GanhosPro</h1>
                        </div>
                        <h2>O fim das contas de padaria.</h2>
                        <p>Saiba exatamente quanto você lucra por KM e por hora. Transforme seus dados de corrida em inteligência financeira e maximize seus ganhos.</p>
                        <Link to="/app" className="cta-button primary">Acessar o Web App</Link>
                    </div>
                    <div className="hero-mockup">
                        <div className="phone">
                            <div className="screen">
                               <div className="mock-header">Resumo do Dia</div>
                               <div className="mock-main-card">
                                   <p>Lucro Líquido</p>
                                   <span>R$ 184,35</span>
                               </div>
                               <div className="mock-grid">
                                   <div className="mock-card">
                                       <p>Lucro/KM</p>
                                       <span>R$ 1,02</span>
                                   </div>
                                   <div className="mock-card">
                                       <p>Lucro/Hora</p>
                                       <span>R$ 23,04</span>
                                   </div>
                                   <div className="mock-card blue">
                                       <p>Ganho Bruto</p>
                                       <span>R$ 310,50</span>
                                   </div>
                                   <div className="mock-card yellow">
                                       <p>Custo Carro</p>
                                       <span>R$ 126,15</span>
                                   </div>
                               </div>
                               <div className="mock-footer">GanhosPro</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <section className="features">
                    <div className="container">
                        <h2 className="section-title">Controle total na palma da sua mão</h2>
                        <div className="features-grid">
                            <div className="feature-card reveal">
                                <div className="feature-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-8-4.5-8-11.5A8 8 0 0 1 12 3a8 8 0 0 1 8 8.5c0 7-8 11.5-8 11.5z"/><path d="M12 7v5l3 3"/></svg>
                                </div>
                                <h3>Cálculo Preciso</h3>
                                <p>Descubra seu lucro líquido real, descontando todos os custos do veículo.</p>
                            </div>
                            <div className="feature-card reveal">
                                <div className="feature-icon">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4.5M16 22V6.5a2.5 2.5 0 0 0-5 0V22M8 22V10.5a2.5 2.5 0 0 1 5 0V22"/><path d="M2 6.5h20"/><path d="M20 15H4"/></svg>
                                </div>
                                <h3>Histórico Detalhado</h3>
                                <p>Visualize seu progresso diário e identifique seus dias e horários mais lucrativos.</p>
                            </div>
                            <div className="feature-card reveal">
                                <div className="feature-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-2.1 2.1-2.1 5.6 0 7.7 2.1 2.1 5.6 2.1 7.7 0l1.4-1.4c.1-.1.2-.3.2-.5 0-.2-.1-.4-.2-.5l-1.4-1.4c-.1-.1-.3-.2-.5-.2s-.4.1-.5.2z"/><path d="m19.5 2.5-4.6 4.6"/><path d="m13.5 8.5 2 2"/><path d="M19.5 2.5c2.1 2.1 2.1 5.6 0 7.7-2.1 2.1-5.6 2.1-7.7 0l-1.4-1.4c-.1-.1-.2-.3-.2-.5 0-.2.1-.4.2-.5l-1.4-1.4c-.1-.1-.3-.2-.5-.2s-.4.1-.5.2z"/><path d="m2.5 19.5 4.6-4.6"/><path d="m8.5 13.5-2-2"/></svg>
                                </div>
                                <h3>Offline-First</h3>
                                <p>O aplicativo funciona perfeitamente sem conexão com a internet. Seus dados estão sempre seguros.</p>
                            </div>
                            <div className="feature-card reveal">
                                 <div className="feature-icon premium">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
                                </div>
                                <h3>Insights com IA (Premium)</h3>
                                <p>Receba análises inteligentes e converse com uma IA para otimizar suas estratégias de ganhos.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="install">
                    <div className="container">
                        <h2 className="section-title">Instale no seu celular em segundos</h2>
                        <p className="section-subtitle">O GanhosPro é um PWA (Progressive Web App), o que significa que você pode adicioná-lo à sua tela inicial como um aplicativo nativo, sem precisar de loja de aplicativos.</p>
                        <div className="install-steps">
                            <div className="install-card reveal">
                                <div className="install-icon android">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 14.7 21 21"/><path d="M16 8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/><path d="m12 12 5 5"/><path d="M21 15.7v2.1a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 17.8V6.2A2.2 2.2 0 0 1 5.2 4h8.6a2.2 2.2 0 0 1 2.2 2.2V8"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                                </div>
                                <h3>Android (Chrome)</h3>
                                <ol>
                                    <li>Abra o <Link to="/app">GanhosPro</Link> no Chrome.</li>
                                    <li>Toque no menu (três pontinhos).</li>
                                    <li>Selecione "Instalar aplicativo".</li>
                                    <li>Pronto! O ícone aparecerá na sua tela.</li>
                                </ol>
                            </div>
                            <div className="install-card reveal">
                                 <div className="install-icon ios">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 6.5c.3-1 .8-1.4 1.5-1.5 1-.3 2 .3 2.5 1.5a2.5 2.5 0 0 1-2.5 3.5c-.9 0-1.5-.5-1.5-1.5Z"/><path d="M19.5 12.5c1.2-.3 2.2.8 2 2-.3 1.3-1.5 2.5-2.5 2.5s-2-1.2-1.5-2.5a2.5 2.5 0 0 1 2-2Z"/><path d="M12 12.5c0-1 .5-2 1.5-2.5 1.2-.5 2.5 0 3.5 1s.5 2.5-1 3.5c-1 1-2.2 1.5-3.5 1s-2-1.5-2-2.5a2.5 2.5 0 0 1 1.5-2Z"/><path d="M12.5 19.5c-1.2.3-2.2-.8-2-2 .3-1.3 1.5-2.5 2.5-2.5s2 1.2 1.5 2.5a2.5 2.5 0 0 1-2 2Z"/><path d="M6.5 12.5c0 .9-.5 1.5-1.5 1.5s-1.5-1-1.5-2.5.5-2.5 1.5-2.5 1.5 1 1.5 2.5Z"/></svg>
                                </div>
                                <h3>iPhone (Safari)</h3>
                                <ol>
                                    <li>Abra o <Link to="/app">GanhosPro</Link> no Safari.</li>
                                    <li>Toque no ícone de Compartilhamento.</li>
                                    <li>Role para baixo e escolha "Adicionar à Tela de Início".</li>
                                    <li>Confirme e o ícone será adicionado.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="container reveal">
                        <h2>Pronto para assumir o controle dos seus ganhos?</h2>
                        <p>Comece a usar gratuitamente. Sem cadastros, sem complicações.</p>
                        <Link to="/app" className="cta-button secondary">Começar Agora</Link>
                    </div>
                </section>
            </main>

            <footer>
                <div className="container">
                    <p>&copy; 2024 GanhosPro. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
