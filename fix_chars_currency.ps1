$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js")

$replacements = @{
    'Rǭpido' = 'Rápido'
    'Preo base - Fica invisvel' = 'Preço base - Fica invisível'
    'ORAMENTO' = 'ORÇAMENTO'
    'PR%-VENDA' = 'PRÉ-VENDA'
    'APROVAǟO' = 'APROVAÇÃO'
    'PRODUǟO' = 'PRODUÇÃO'
    'mǭximo' = 'máximo'
    'Cartǜo de CrǸdito' = 'Cartão de crédito / A vista'
    'Cartǜo de DǸbito' = 'Débito'
    'TransferǦncia' = 'Pix'
    'Observaǜo / NSU' = 'Observação'
    'Pea' = 'Peça'
    'Cǭlculo' = 'Cálculo'
    'Dimenses' = 'Dimensões'
    '?rea Total' = 'Área Total'
    'Valor Unitǭrio' = 'Valor Unitário'
    'Olǭ ' = 'Olá '
    'Por m' = 'Por m²'
    ' m' = ' m²'
    'Preo' = 'Preço'
    'Cartão de Crédito' = 'Cartão de crédito / A vista'
}

foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

# Fix Payment Methods array:
$oldMetodoHtml = '(?s)<select id="fm-metodo".*?</select>'
$newMetodoHtml = @'
<select id="fm-metodo" class="w-full p-3 border border-slate-300 rounded-lg font-bold text-sm bg-white">
                  <option value="Dinheiro / Cash" ${metodoAtual === 'Dinheiro / Cash' ? 'selected' : ''}>Dinheiro / Cash</option>
                  <option value="Cartão de crédito / A vista" ${metodoAtual === 'Cartão de crédito / A vista' ? 'selected' : ''}>Cartão de crédito / A vista</option>
                  <option value="Cartão de crédito / Parcelado" ${metodoAtual === 'Cartão de crédito / Parcelado' ? 'selected' : ''}>Cartão de crédito / Parcelado</option>
                  <option value="Débito" ${metodoAtual === 'Débito' ? 'selected' : ''}>Débito</option>
                  <option value="Pix" ${metodoAtual === 'Pix' ? 'selected' : ''}>Pix</option>
                  <option value="Permuta" ${metodoAtual === 'Permuta' ? 'selected' : ''}>Permuta</option>
                </select>
'@
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldMetodoHtml, $newMetodoHtml)

# Default 'Dinheiro' string is used in confirmFinance and printReceipt, let's update it to 'Dinheiro / Cash'
$content = $content.Replace("|| 'Dinheiro'", "|| 'Dinheiro / Cash'")
$content = $content.Replace("=== 'Dinheiro'", "=== 'Dinheiro / Cash'")

# Format Currency throughout sales.js
$content = $content.Replace("R$ `${total.toFixed(2)}", "R$ `${total.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ `${recebido.toFixed(2)}", "R$ `${recebido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ `${rest.toFixed(2)}", "R$ `${rest.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ `${restante.toFixed(2)}", "R$ `${restante.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ `${piecePrice.toFixed(2)}", "R$ `${piecePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ `${Number(it.preco_unitario).toFixed(2)}", "R$ `${Number(it.preco_unitario).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ `${Number(it.valor_total).toFixed(2)}", "R$ `${Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")

# The one in recalcTotals:
$content = $content.Replace("innerText = 'R$ ' + subtotal.toFixed(2)", "innerText = 'R$ ' + subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})")
$content = $content.Replace("innerText = 'R$ ' + finalTotal.toFixed(2)", "innerText = 'R$ ' + finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})")
$content = $content.Replace("R$ `${(piecePrice * qty).toFixed(2)}", "R$ `${(piecePrice * qty).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}")
$content = $content.Replace("R$ ' + Number(it.valor_total).toFixed(2)", "R$ ' + Number(it.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})")

# Write using standard UTF8 (without BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, $utf8NoBom)
