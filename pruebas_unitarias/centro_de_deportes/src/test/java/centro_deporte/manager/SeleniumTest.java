package centro_deporte.manager;
import org.junit.Assert;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SeleniumTest {

    private WebDriver driver;

    @BeforeEach
    void preparar() {
        driver = new ChromeDriver();
        driver.manage().deleteAllCookies();
        driver.manage().window().maximize();

    }

    @AfterEach
    void finalizar() {
        driver.quit();
    }

    @Test
    void abrirPagina() throws InterruptedException {

        driver.get("https://www.google.com/?gws_rd=cr&ei=bIeRVIzyB8KLNsjagvgK");
        Thread.sleep(2000);
        driver.findElement(By.className("gLFyf")).sendKeys("Uruguay");
        Thread.sleep(2000);
        driver.findElement(By.className("gLFyf"))
                .sendKeys(Keys.ENTER);


        assertTrue(driver.getTitle().contains("Uruguay"),
                "La búsqueda no se realizó correctamente");
        Thread.sleep(2000);
    }

    @Test
    void HolaMundo() throws InterruptedException {
        driver.get("https://es.wikipedia.org/wiki/Wikipedia:Portada");
        WebElement buscador = driver.findElement(By.name("search"));
        buscador.sendKeys("Hola mundo");

        WebElement botonBuscar = driver.findElement(By.className("cdx-search-input__end-button"));
        botonBuscar.click();

        Assert.assertTrue(driver.getTitle().contains("Hola mundo"));
        Thread.sleep(2000);
    }

    @Test
    void AccederCES() throws InterruptedException {

        String usuario = "ci54387488";
        String contraseña = "bjm2715_";

        driver.get("https://capacitacion.ces.com.uy/");
        Thread.sleep(2000);

        driver.findElement(By.cssSelector("a[href='https://capacitacion.ces.com.uy/login/index.php']")).click();
        Thread.sleep(2000);
        driver.findElement(By.id("username")).sendKeys(usuario);
        Thread.sleep(2000);
        driver.findElement(By.id("password")).sendKeys(contraseña);
        Thread.sleep(2000);
        driver.findElement(By.id("loginbtn")).click();
        Thread.sleep(2000);

        driver.findElement(By.id("user-menu-toggle")).click();
        Thread.sleep(2000);
        driver.findElement(By.linkText("Mis cursos")).click();
        Thread.sleep(10000);
        for (String ventana : driver.getWindowHandles()) {
            driver.switchTo().window(ventana);

            if (driver.getCurrentUrl().contains("my/courses.php")) {
                break;
            }
        }
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        WebElement buscador = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("searchinput")));
        Thread.sleep(10000);
        buscador.clear();
        buscador.sendKeys("Taller de Automatización del Testing Funcional");

        Thread.sleep(5000);

        driver.findElement(By.cssSelector("a[href*='course/view.php?id=1128']")).click();
        Thread.sleep(2000);

        driver.findElement(By.xpath("//a[contains(normalize-space(), 'Foros')]")).click();
        Thread.sleep(2000);
        driver.findElement(By.name("search")).sendKeys("Bienvenida");
        Thread.sleep(2000);
        driver.findElement(By.name("search")).sendKeys(Keys.ENTER);

        WebDriverWait wait2 = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement resultado = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector("span.highlight")));

        String texto = resultado.getText();

        Assertions.assertEquals("bienvenida", texto.toLowerCase(),
                "El resultado no es el esperado");
        Thread.sleep(2000);
    }
}





