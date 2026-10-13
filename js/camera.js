const botaoIniciarCamera = document.querySelector("[data-video-botao]");
const campoCamera = document.querySelector("[data-camera]");
const video = document.querySelector("[data-video]");
const tirarFoto = document.querySelector("[data-tirar-foto]");
const canvas = document.querySelector("[data-video-canvas]");
const mensagem = document.querySelector("[data-mensagem]");
const botaoConcluir = document.querySelector("[data-enviar]");
const statusCamera = document.getElementById("status-camera");
let stream;
let solicitando = false;
let ativa = true;
let capturada = false;
let versaoSolicitacao = 0;
function pararCamera() {
  stream?.getTracks().forEach(track => track.stop());
  video.srcObject = null;
  stream = undefined;
}
function encerrarCamera() {
  ativa = false;
  versaoSolicitacao++;
  solicitando = false;
  botaoIniciarCamera.disabled = false;
  pararCamera();
  campoCamera.style.display = "none";
  if (!capturada) {
    botaoIniciarCamera.style.display = "";
    statusCamera.textContent = "";
  }
}
botaoIniciarCamera.addEventListener("click", async () => {
  if (!ativa || solicitando || stream || capturada) return;
  if (!navigator.mediaDevices?.getUserMedia) {
    statusCamera.textContent = "Câmera indisponível. Você pode pular a câmera e concluir a demonstração.";
    return;
  }
  solicitando = true;
  botaoIniciarCamera.disabled = true;
  const solicitacao = ++versaoSolicitacao;
  try {
    const novaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    if (!ativa || solicitacao !== versaoSolicitacao) {
      novaStream.getTracks().forEach(track => track.stop());
      return;
    }
    stream = novaStream;
    video.srcObject = stream;
    botaoIniciarCamera.style.display = "none";
    campoCamera.style.display = "block";
    statusCamera.textContent = "Câmera ativa. A imagem ficará apenas nesta página.";
  } catch {
    if (ativa && solicitacao === versaoSolicitacao) {
      statusCamera.textContent = "Não foi possível acessar a câmera. Confira a permissão e tente novamente ou pule a câmera e conclua.";
    }
  } finally {
    if (solicitacao === versaoSolicitacao) {
      solicitando = false;
      botaoIniciarCamera.disabled = false;
    }
  }
});
tirarFoto.addEventListener("click", () => {
  if (!stream || !video.videoWidth) { statusCamera.textContent = "Aguarde a câmera ficar pronta."; return; }
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  capturada = true;
  pararCamera();
  campoCamera.style.display = "none";
  mensagem.style.display = "block";
  botaoConcluir.textContent = "Concluir demonstração";
  statusCamera.textContent = "Prévia capturada. A câmera foi desligada; nenhuma foto será enviada ou salva.";
});
botaoConcluir.addEventListener("click", evento => {
  evento.preventDefault();
  encerrarCamera();
  window.location.href = "./abrir-conta-form-3.html";
});
window.addEventListener("pagehide", encerrarCamera);
window.addEventListener("pageshow", () => { ativa = true; });
