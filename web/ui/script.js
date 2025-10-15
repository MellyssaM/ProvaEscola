
let turmaAtualId = null; 
let usuarioGlobal = null;

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  usuarioGlobal = usuario;

  if (!usuario) {
    alert("Você precisa estar logado para acessar esta página!");
    window.location.href = "../login/index.html"; 
    return;
  }

 
  criarBotaoLogout();


  document.getElementById("btnCadastrarTurma").style.display = "inline-block";

  document.getElementById("btnVoltarTurmas").addEventListener("click", voltarParaTurmas);

  carregarTurmas(usuario);

  configurarModais();
});


function criarBotaoLogout() {
  const topbar = document.querySelector(".topbar");
  const btnLogout = document.createElement("button");
  btnLogout.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
  btnLogout.classList.add("logout-btn");
  btnLogout.onclick = () => {
    sessionStorage.removeItem("usuario");
    window.location.href = "../login/index.html";
  };
  topbar.appendChild(btnLogout);
}


async function carregarTurmas(usuario) {
  try {
    const response = await fetch("http://localhost:3000/turma");
    if (!response.ok) throw new Error("Erro ao buscar turmas");
    const turmas = await response.json();

    const lista = document.getElementById("listaTurmas");
    lista.innerHTML = "";

    turmas.forEach((turma, index) => {
      const tr = document.createElement("tr");

      
      const tdIndex = document.createElement("td");
      tdIndex.textContent = index + 1;

      const tdNome = document.createElement("td");
      tdNome.textContent = turma.nome;

      const tdAcoes = document.createElement("td");

    
      const btnAtualizar = document.createElement("button");
      btnAtualizar.className = "btn btn-edit";
      btnAtualizar.textContent = "Atualizar";
      btnAtualizar.addEventListener("click", () => abrirModalAtualizarTurma(turma.id, turma.nome));


      const btnExcluir = document.createElement("button");
      btnExcluir.className = "btn btn-delete";
      btnExcluir.textContent = "Excluir";
      btnExcluir.addEventListener("click", () => excluirTurma(turma.id));

      const btnAtividades = document.createElement("button");
      btnAtividades.className = "btn btn-view";
      btnAtividades.textContent = "Atividades";
      btnAtividades.addEventListener("click", () => visualizarAtividades(turma.id, turma.nome));

      tdAcoes.appendChild(btnAtualizar);
      tdAcoes.appendChild(btnExcluir);
      tdAcoes.appendChild(btnAtividades);

      tr.appendChild(tdIndex);
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);

      lista.appendChild(tr);
    });
  } catch (err) {
    alert("Erro ao carregar turmas: " + err.message);
  }
}

function configurarModais() {

  const modalTurma = document.getElementById("modalTurma");
  const formTurma = document.getElementById("formTurma");

  const modalAtividade = document.getElementById("modalAtividade");
  const formAtividade = document.getElementById("formAtividade");
  const btnCadastrarTurma = document.getElementById("btnCadastrarTurma");
  const btnCadastrarAtividade = document.getElementById("btnCadastrarAtividade");

  btnCadastrarTurma.addEventListener("click", () => {
    delete formTurma.dataset.id;
    formTurma.reset();
    modalTurma.style.display = "block";
  });

  btnCadastrarAtividade.addEventListener("click", () => {
    if (!turmaAtualId) {
      alert("Nenhuma turma selecionada.");
      return;
    }
    delete formAtividade.dataset.id;
    formAtividade.reset();
    modalAtividade.style.display = "block";
  });

  document.querySelectorAll(".modal .close").forEach((el) => {
    el.addEventListener("click", (e) => {
      const target = e.currentTarget.getAttribute("data-target");
      if (target === "modalTurma") {
        modalTurma.style.display = "none";
        formTurma.reset();
        delete formTurma.dataset.id;
      } else if (target === "modalAtividade") {
        modalAtividade.style.display = "none";
        formAtividade.reset();
        delete formAtividade.dataset.id;
        turmaAtualId = null;
      }
    });
  });

  window.addEventListener("click", (event) => {
    if (event.target === modalTurma) {
      modalTurma.style.display = "none";
      formTurma.reset();
      delete formTurma.dataset.id;
    }
    if (event.target === modalAtividade) {
      modalAtividade.style.display = "none";
      formAtividade.reset();
      delete formAtividade.dataset.id;
      turmaAtualId = null;
    }
  });

  formTurma.onsubmit = async (e) => {
    e.preventDefault();
    const id = formTurma.dataset.id;
    const nome = formTurma.nomeTurma.value.trim();

    if (!nome) {
      alert("Digite o nome da turma");
      return;
    }

    try {
      let res;
      if (id) {

        res = await fetch(`http://localhost:3000/turma/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome }),
        });
      } else {

        res = await fetch("http://localhost:3000/turma", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome }),
        });
      }

      if (!res.ok) throw new Error("Erro ao salvar turma");

      modalTurma.style.display = "none";
      formTurma.reset();
      delete formTurma.dataset.id;

      carregarTurmas(usuarioGlobal);
    } catch (err) {
      alert(err.message);
    }
  };

  formAtividade.onsubmit = async (e) => {
    e.preventDefault();

    const id = formAtividade.dataset.id;
    const nome = formAtividade.nomeAtividade.value.trim();

    if (!nome || !turmaAtualId) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      let res;
      if (id) {

        res = await fetch(`http://localhost:3000/atividade/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, turma_id: turmaAtualId }),
        });
      } else {

        res = await fetch("http://localhost:3000/atividade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            turma_id: turmaAtualId,
          }),
        });
      }

      if (!res.ok) throw new Error("Erro ao salvar atividade");

      modalAtividade.style.display = "none";
      formAtividade.reset();
      delete formAtividade.dataset.id;

      const nomeTurma = document.getElementById("nomeTurmaAtividades").textContent || "";
      visualizarAtividades(turmaAtualId, nomeTurma);
    } catch (err) {
      alert(err.message);
    }
  };

  window.abrirModalAtualizarTurma = (id, nome) => {
    formTurma.dataset.id = id;
    formTurma.nomeTurma.value = nome;
    modalTurma.style.display = "block";
  };

  window.abrirModalAtualizarAtividade = (id, nome, turma_id) => {
    turmaAtualId = Number(turma_id);
    formAtividade.dataset.id = id;
    formAtividade.nomeAtividade.value = nome;
    modalAtividade.style.display = "block";
  };

  window.abrirModalAtividade = (turmaId) => {
    turmaAtualId = Number(turmaId);
    delete formAtividade.dataset.id;
    formAtividade.reset();
    modalAtividade.style.display = "block";
  };

  document.getElementById("turmas-section").addEventListener("show", () => {
    btnCadastrarAtividade.style.display = "none";
  });

  btnCadastrarAtividade.style.display = "none";
}

// Excluir turma
async function excluirTurma(id) {
  if (!confirm("Deseja realmente excluir esta turma?")) return;

  try {
    const res = await fetch(`http://localhost:3000/turma/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao excluir turma");

    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    carregarTurmas(usuario);
  } catch (err) {
    alert(err.message);
  }
}

async function visualizarAtividades(turmaId, nomeTurma) {
  turmaAtualId = Number(turmaId);
  document.getElementById("nomeTurmaAtividades").textContent = nomeTurma;
  document.getElementById("turmas-section").style.display = "none";
  document.getElementById("atividades-section").style.display = "block";

  const btnCadastrarAtividade = document.getElementById("btnCadastrarAtividade");
  btnCadastrarAtividade.style.display = "inline-block";

  try {
    const res = await fetch("http://localhost:3000/atividade");
    if (!res.ok) throw new Error("Erro ao buscar atividades");
    const atividades = await res.json();

    const atividadesFiltradas = atividades.filter(
      (a) => Number(a.turma_id) === Number(turmaId)
    );

    const lista = document.getElementById("listaAtividades");
    lista.innerHTML = "";

    atividadesFiltradas.forEach((atividade, index) => {
      const tr = document.createElement("tr");

      const tdIndex = document.createElement("td");
      tdIndex.textContent = index + 1;

      const tdNome = document.createElement("td");
      tdNome.textContent = atividade.nome;

      const tdAcoes = document.createElement("td");

      const btnAtualizar = document.createElement("button");
      btnAtualizar.className = "btn btn-edit";
      btnAtualizar.textContent = "Atualizar";
      btnAtualizar.addEventListener("click", () =>
        window.abrirModalAtualizarAtividade(atividade.id, atividade.nome, atividade.turma_id)
      );

      const btnExcluir = document.createElement("button");
      btnExcluir.className = "btn btn-delete";
      btnExcluir.textContent = "Excluir";
      btnExcluir.addEventListener("click", () => excluirAtividade(atividade.id, atividade.turma_id));

      tdAcoes.appendChild(btnAtualizar);
      tdAcoes.appendChild(btnExcluir);

      tr.appendChild(tdIndex);
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);

      lista.appendChild(tr);
    });
  } catch (err) {
    alert(err.message);
  }
}

async function excluirAtividade(id, turmaId) {
  if (!confirm("Deseja realmente excluir esta atividade?")) return;

  try {
    const res = await fetch(`http://localhost:3000/atividade/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao excluir atividade");

    const nomeTurma = document.getElementById("nomeTurmaAtividades").textContent || "";
    visualizarAtividades(turmaId, nomeTurma);
  } catch (err) {
    alert(err.message);
  }
}

function voltarParaTurmas() {
  document.getElementById("atividades-section").style.display = "none";
  document.getElementById("turmas-section").style.display = "block";

  document.getElementById("btnCadastrarAtividade").style.display = "none";
  carregarTurmas(usuarioGlobal);
}
