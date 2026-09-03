package centro_deporte.manager;
import org.junit.Assert;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;

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

        String titulo = driver.getTitle();
        Assertions.assertEquals("Google", titulo, "El titulo de la página no es el que se busca");
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
        WebElement acceder = driver.findElement(
                By.cssSelector("a[href='https://capacitacion.ces.com.uy/login/index.php']"));
        acceder.click();
        driver.findElement(By.id("username")).click();
        driver.findElement(By.id("username")).sendKeys(usuario);
        driver.findElement(By.id("password")).click();
        driver.findElement(By.id("password")).sendKeys(contraseña);
        driver.findElement(By.id("loginbtn")).click();
        driver.findElement(By.id("user-menu-toggle")).click();
        driver.get("https://capacitacion.ces.com.uy/my/courses.php");
        driver.get("https://capacitacion.ces.com.uy/course/view.php?id=1128");
        driver.findElement(By.className("activityname")).click();
        driver.findElement(By.name("search")).click();
        driver.findElement(By.name("search")).sendKeys("Bienvenidos/as al curso!");
        driver.findElement(By.className("search-icon")).click();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement titulo = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.className("font-weight-bold")
                )
        );

        String texto = titulo.getText();

        Assertions.assertEquals("Novedades del curso -> Bienvenidos/as al curso!",texto,"El resultado no es el esperado");
        Thread.sleep(2000);
    }
}





